import fs from 'fs-extra';
import path from 'path';
import EventEmitter from 'events';
const Recipe       = require('./recipe');
const directories  = require('../directories');
const tasks        = require('./tasks');

const runDeleteTimeout = 10 * 60 * 1000; // 10 mins

function formatTaskName(name) {
  return name
    .replace(/^./, str => str.toLowerCase())
    .replace(/([A-Z])/g, str => '-' + str.toLowerCase());
}

class Manager extends EventEmitter {

  constructor() {
    super();
    this._runIdCounter = 0;
    this._runs         = new Map();
    this._recipes      = new Map();
    this._closing      = false;

    // load recipes
    fs.ensureDirSync(directories.recipes());

    for(const file of fs.readdirSync(directories.recipes())) {
      const fullname = path.join(directories.recipes(), file);
      const name     = path.parse(file).name;
      const content  = JSON.parse(fs.readFileSync(fullname, 'utf8'));

      this._recipes.set(name, content);
    }
  }

  listTasksMeta() {
    return Object.entries(tasks).map(([ name, task ]) => ({ name : formatTaskName(name), ... task.metadata }));
  }

  createRecipe(name, content) {
    fs.ensureDirSync(directories.recipes());

    const fullname = path.join(directories.recipes(), name + '.json');
    const exists = fs.existsSync(fullname);
    fs.writeFileSync(fullname, JSON.stringify(content));

    this._recipes.set(name, content);
    this.emit(exists ? 'recipe-updated' : 'recipe-created', name);
  }

  deleteRecipe(name) {
    fs.ensureDirSync(directories.recipes());

    const fullname = path.join(directories.recipes(), name + '.json');
    if(!fs.existsSync(fullname)) {
      return;
    }

    fs.unlinkSync(fullname);

    this._recipes.delete(name);
    this.emit('recipe-deleted', name);
  }

  listRecipes() {
    return Array.from(this._recipes.keys());
  }

  // no copy!
  getRecipe(name) {
    return this._recipes.get(name);
  }

  startRecipe(name) {
    if(this._closing) {
      throw new Error('Cannot start recipe while closing manager');
    }

    let runId;
    this.once('run-begin', id => { runId = id; });
    this.runRecipe(name);
    return runId;
  }

  async close() {
    this._closing = true;

    // wait pending runs
    let pendings = Array.from(this._runs.values()).filter(run => run.status === 'running').length;
    if(pendings) {
      await new Promise(resolve => this.on('run-end', () => (!--pendings && resolve())));
    }

    // do not wait delete timeout
    for(const run of Array.from(this._runs.values())) {
      clearTimeout(run._deleteTimeout);
      this._runs.delete(run.id);
    }
  }

  async runRecipe(name) {
    if(this._closing) {
      throw new Error('Cannot start recipe while closing manager');
    }

    const run = {
      id       : ++this._runIdCounter,
      recipe   : name,
      logs     : [],
      status   : 'created',
      creation : Date.now()
    };

    const logger = (category, severity, message) => {
      const log = { date : Date.now(), category, severity, message };
      run.logs.push(log);
      this.emit('run-log', run.id, log);
    };

    this._runs.set(run.id, run);
    this.emit('run-created', run.id, run.recipe);

    run.status = 'running';
    this.emit('run-begin', run.id);

    try {

      const recipe = new Recipe(name);
      const context = { logger };

      await recipe.execute(context);

    } catch(err) {
      run.err = err;
    }

    run.status = 'ended';
    run.end    = Date.now();
    run.err ?
      this.emit('run-end', run.id, run.err) :
      this.emit('run-end', run.id);

    run._deleteTimeout = setTimeout(() => {
      this.emit('run-deleted', run.id);
      this._runs.delete(run.id);
    }, runDeleteTimeout);
  }

  listRuns() {
    return Array.from(this._runs.keys());
  }

  getRun(runId, logs = true) {
    const run = this._runs.get(runId);
    if(!run) { return; }
    const ret = {};
    for(const [key, value] of Object.entries(run)) {
      if(key.startsWith('_')) { continue; }
      if(!logs && key === 'logs') { continue; }
      ret[key] = value;
    }
    return ret;
  }
}

module.exports = Manager;
