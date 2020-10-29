'use strict';

const path        = require('path');
const fs          = require('fs-extra');
const { expect }  = require('chai');
const Manager     = require('../../lib/engine/manager');
const directories = require('../../lib/directories');

class ManagerEvents {

  constructor(manager) {
    this.manager   = manager;
    this.listeners = {};
    this.events    = [];

    [
      'recipe-updated',
      'recipe-created',
      'recipe-deleted',
      'run-log',
      'run-created',
      'run-begin',
      'run-end',
      'run-delete'
    ].forEach(name => this.createListener(name));
  }

  close() {
    for(const [name, listener] of Object.entries(this.listeners)) {
      this.manager.removeListener(name, listener);
    }
  }

  createListener(name) {
    const listener = (...args) => this.events.push({ name, args });
    this.listeners[name] = listener;
    this.manager.on(name, listener);
  }
}

async function managerScope(cb) {
  const manager = new Manager();
  const me = new ManagerEvents(manager);
  const result = await cb(manager);
  me.close();
  await manager.close();
  return { result, events : me.events };
}

async function waitTaskEnd(manager, runId) {
  if(manager.getRun(runId).status === 'ended') {
    return;
  }

  return new Promise(resolve => {
    const listener = endRunId => {
      if(endRunId !== runId) {
        return;
      }

      manager.removeListener('run-end', listener);
      return resolve();
    };
    manager.on('run-end', listener);
  });
}

function stripRunTimes(run) {
  delete run.creation;
  delete run.end;
  run.logs.forEach(it => delete it.date);
  return run;
}

describe('Manager', () => {

  beforeEach(dataDirInit);
  afterEach(dataDirDestroy);

  it('Should provide metadata of tasks', async () => {
    const { result } = await managerScope(async manager => manager.listTasksMeta());

    expect(result).to.deep.equal([ {
      name        : 'config-init',
      description : 'Extract the config (.apkovl.tar.gz) from the image to context.config',
      parameters  : []
    }, {
      name        : 'config-import',
      description : 'Import the specified archive into the root fs of the config',
      parameters  : [
        { name : 'archiveName', description : 'archive name', type : 'string' },
      ]
    }, {
      name        : 'config-hostname',
      description : 'set the hostname',
      parameters  : [
        { name : 'hostname', description : 'host name', type : 'string' }
      ]
    }, {
      name        : 'config-hwaddress',
      description : 'set the hardware address of a network interface',
      parameters  : [
        { name : 'iface',   description : 'network interface name (eg: eth0)',          type : 'string' },
        { name : 'address', description : 'mac address to set (eg: 11:22:33:44:55:66)', type : 'string' }
      ]
    }, {
      name        : 'config-wifi',
      description : 'configure a wifi interface (wpa_supplicant package and daemon required)',
      parameters  : [
        { name : 'iface', description : 'network interface name (eg: wlan0)',                          type : 'string' },
        { name : 'ssid',  description : 'wifi ssid',                                                   type : 'string' },
        { name : 'psk',   description : 'psk as in command output : wpa_passphrase MYSSID passphrase', type : 'string' }
      ]
    }, {
      name        : 'config-package',
      description : 'add a package to be installed',
      parameters  : [
        { name : 'name', description : 'package name', type : 'string' }
      ]
    }, {
      name        : 'config-daemon',
      description : 'add a daemon process to be started at a runlevel',
      parameters  : [
        { name : 'name',     description : 'daemon name', type : 'string' },
        { name : 'runlevel', description : 'runlevel',    type : 'string', default : 'default' }
      ]
    }, {
      name        : 'config-ls',
      description : 'print the content of a directory from the config fs',
      parameters  : [
        { description : 'path to directory to list', name : 'path', type : 'string' }
      ]
    }, {
      name        : 'config-pack',
      description : 'pack the config into the root fs',
      parameters  : []
    }, {
      name        : 'image-import',
      description : 'import the specified archive into the root fs of the image',
      parameters  : [
        { name : 'archiveName', description : 'archive name',                           type : 'string' },
        { name : 'rootPath',    description : 'path of the root fs inside the archive', type : 'string', default : '' }
      ]
    }, {
      name        : 'image-remove',
      description : 'remove a node (file/directory/symlink) from the root fs',
      parameters  : [
        { name : 'path', description : 'path to remove name', type : 'string' }
      ]
    }, {
      name        : 'image-cache',
      description : 'setup package cache of the image, from /etc/apk/repositories and /etc/apk/world in config (equivalent of apk cache sync in some way)',
      parameters  : []
    }, {
      name        : 'image-device-tree-overlay',
      description : 'add a dtoverlay line in image usercfg.txt ( https://www.raspberrypi.org/documentation/configuration/device-tree.md )',
      parameters  : [
        { name : 'content', description : 'overlay data to add', type : 'string' }
      ]
    }, {
      name        : 'image-device-tree-param',
      description : 'add a dtparam line in image usercfg.txt ( https://www.raspberrypi.org/documentation/configuration/device-tree.md )',
      parameters  : [
        { name : 'content', description : 'param data to add', type : 'string' }
      ]
    }, {
      name        : 'image-cmdline-add',
      description : 'add a parameter to cmdline.txt',
      parameters  : [
        { name : 'content', description : 'parameter data to add', type : 'string' }
      ]
    }, {
      name        : 'image-cmdline-remove',
      description : 'remove a parameter from cmdline.txt',
      parameters  : [
        { name : 'content', description : 'parameter data to search and remove', type : 'string' }
      ]
    }, {
      name        : 'image-core-components',
      description : 'setup core components file',
      parameters  : [
        { name : 'file',   description : 'file name to import',              type : 'string' },
        { name : 'flavor', description : 'flavor of mylife-home-core setup', type : 'string', default : '' }
      ]
    }, {
      name        : 'image-ls',
      description : 'print the content of a directory from the root fs',
      parameters  : [
        { name : 'path', description : 'path to directory to list', type : 'string' }
      ]
    }, {
      name        : 'image-install',
      description : 'install the current root fs to the target host using SSH',
      parameters  : [
        { name : 'host',    description : 'Target host',                type : 'string' },
        { name : 'user',    description : 'User to use on target host', type : 'string' },
        { name : 'keyFile', description : 'SSH key to log in',          type : 'string' }
      ]
    }, {
      name        : 'image-export',
      description : 'export the root fs of the image into the specified archive',
      parameters  : [
        { name : 'archiveName', description : 'archive name', type : 'string' }
      ]
    }, {
      name        : 'image-reset',
      description : 'reset image data (root fs, config, image)',
      parameters  : []
    }, {
      name        : 'variables-set',
      description : 'set a variable to a value',
      parameters  : [
        { name : 'name',  description : 'variable name',  type : 'string' },
        { name : 'value', description : 'variable value', type : 'string' }
      ]
    }, {
      name        : 'variables-reset',
      description : 'reset variables',
      parameters  : []
    } ]);
  });

  it('Should create and retrieve a simple recipe', async () => {
    const { result, events } = await managerScope(async manager => {
      manager.createRecipe('recipe', { steps : [{ type: 'task', name: 'variables-set', parameters: { name: 'variable1', value: 'value1' } }] });
      return manager.getRecipe('recipe');
    });

    expect(result).to.deep.equal({ steps : [{ type: 'task', name: 'variables-set', parameters: { name: 'variable1', value: 'value1' } }] });
    expect(events).to.deep.equal([
      { name: 'recipe-created', args: [ 'recipe' ] }
    ]);
  });

  it('Should delete a simple recipe', async () => {
    const { result, events } = await managerScope(async manager => {
      manager.createRecipe('recipe', { steps : [{ type: 'task', name: 'variables-set', parameters: { name: 'variable1', value: 'value1' } }] });
      manager.deleteRecipe('recipe');
      return manager.listRecipes();
    });

    expect(result).to.deep.equal([]);
    expect(events).to.deep.equal([
      { name: 'recipe-created', args: [ 'recipe' ] },
      { name: 'recipe-deleted', args: [ 'recipe' ] }
    ]);
  });

  it('Should update a simple recipe', async () => {
    const { result, events } = await managerScope(async manager => {
      manager.createRecipe('recipe', { steps : [{ type: 'task', name: 'variables-set', parameters: { name: 'variable1', value: 'value1' } }] });
      manager.createRecipe('recipe', { steps : [{ type: 'task', name: 'variables-set', parameters: { name: 'variable2', value: 'value2' } }] });
      return manager.getRecipe('recipe');
    });

    expect(result).to.deep.equal({ steps : [{ type: 'task', name: 'variables-set', parameters: { name: 'variable2', value: 'value2' } }] });
    expect(events).to.deep.equal([
      { name: 'recipe-created', args: [ 'recipe' ] },
      { name: 'recipe-updated', args: [ 'recipe' ] }
    ]);
  });

  it('Should list recipes', async () => {
    const { result, events } = await managerScope(async manager => {
      manager.createRecipe('recipe1', { steps : [{ type: 'task', name: 'variables-set', parameters: { name: 'variable1', value: 'value1' } }] });
      manager.createRecipe('recipe2', { steps : [{ type: 'task', name: 'variables-set', parameters: { name: 'variable2', value: 'value2' } }] });
      return manager.listRecipes();
    });

    expect(result).to.deep.equal([ 'recipe1', 'recipe2' ]);
    expect(events).to.deep.equal([
      { name: 'recipe-created', args: [ 'recipe1' ] },
      { name: 'recipe-created', args: [ 'recipe2' ] }
    ]);
  });

  it('Should persist recipes', async () => {
    await managerScope(async manager => {
      manager.createRecipe('recipe1', { steps : [{ type: 'task', name: 'variables-set', parameters: { name: 'variable1', value: 'value1' } }] });
      manager.createRecipe('recipe2', { steps : [{ type: 'task', name: 'variables-set', parameters: { name: 'variable2', value: 'value2' } }] });
    });

    const { result } = await managerScope(async manager => {
      return manager.listRecipes();
    });

    expect(result).to.deep.equal([ 'recipe1', 'recipe2' ]);
  });

  it('Should execute a simple recipe', async () => {
    const { result, events } = await managerScope(async manager => {
      manager.createRecipe('recipe', { steps : [
        { type: 'task', name: 'variables-set', parameters: { name: 'variable1', value: 'value1' } },
        { type: 'task', name: 'variables-set', parameters: { name: 'variable2', value: 'value2' } }
      ]});

      const runId = manager.startRecipe('recipe');

      await waitTaskEnd(manager, runId);

      return {
        runs : manager.listRuns(),
        run  : stripRunTimes(manager.getRun(runId))
      };
    });

    expect(result).to.deep.equal({
      runs : [ 1 ],
      run  : {
        id     : 1,
        recipe : 'recipe',
        status : 'ended',
        logs   : [
          { severity : 'info', category : 'recipe',        message : 'begin \'recipe\''   },
          { severity : 'info', category : 'variables:set', message : 'variable1 = value1' },
          { severity : 'info', category : 'variables:set', message : 'variable2 = value2' },
          { severity : 'info', category : 'recipe',        message : 'end \'recipe\''     }
        ]
      }
    });

    expect(events).to.deep.equal([
      { name: 'recipe-created', args: [ 'recipe' ] },
      { name: 'run-created',    args: [ 1, 'recipe' ] },
      { name: 'run-begin',      args: [ 1 ] },
      { name: 'run-log',        args: [ 1, { severity: 'info', category: 'recipe',        message: 'begin \'recipe\''   } ] },
      { name: 'run-log',        args: [ 1, { severity: 'info', category: 'variables:set', message: 'variable1 = value1' } ] },
      { name: 'run-log',        args: [ 1, { severity: 'info', category: 'variables:set', message: 'variable2 = value2' } ] },
      { name: 'run-log',        args: [ 1, { severity: 'info', category: 'recipe',        message: 'end \'recipe\''     } ] },
      { name: 'run-end',        args: [ 1 ] }
    ]);
  });

  it('Should execute a recipe with real async tasks', async () => {
    await fs.ensureDir(directories.files());
    await fs.link(path.resolve(__dirname, '../resources/files/rpi-devel-base.tar.gz'), path.join(directories.files(), 'rpi-devel-base.tar.gz'));

    const { result } = await managerScope(async manager => {
      manager.createRecipe('recipe', { steps : [
        { type: 'task', name: 'image-import', parameters: { archiveName : 'rpi-devel-base.tar.gz', rootPath : 'mmcblk0p1' } },
        { type: 'task', name: 'config-init', parameters: { } }
      ]});

      const runId = manager.startRecipe('recipe');

      await waitTaskEnd(manager, runId);

      return stripRunTimes(manager.getRun(runId));
    });

    result.logs = result.logs.filter(it => it.severity !== 'debug');

    expect(result).to.deep.equal({
      id     : 1,
      recipe : 'recipe',
      status : 'ended',
      logs   : [
        { severity : 'info', category : 'recipe',       message: 'begin \'recipe\''                                                                                                     },
        { severity : 'info', category : 'image:import', message: 'import \'/tmp/mylife-home-deploy-test-manager/files/rpi-devel-base.tar.gz\' using root path \'mmcblk0p1\' into image' },
        { severity : 'info', category : 'config:init',  message: 'extract config from image file \'rpi-devel.apkovl.tar.gz\''                                                           },
        { severity : 'info', category : 'recipe',       message: 'end \'recipe\''                                                                                                       }
      ]
    });
  });
});

const dataDir = '/tmp/mylife-home-deploy-test-manager';

async function dataDirInit() {
  await fs.ensureDir(dataDir);
  directories.configure(dataDir);
}

async function dataDirDestroy() {
  await fs.remove(dataDir);
}
