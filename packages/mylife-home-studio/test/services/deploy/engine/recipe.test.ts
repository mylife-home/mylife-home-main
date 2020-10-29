'use strict';

const { expect }  = require('chai');
const path        = require('path');
const fs          = require('fs-extra');
const directories = require('../../lib/directories');
const Recipe      = require('../../lib/engine/recipe');

const logger = (category, severity, message) => {
  process.env.VERBOSE === '1' && console.log(`${severity} : [${category}] ${message}`); // eslint-disable-line no-console
};

describe('Recipe', () => {

  beforeEach(dataDirInit);
  afterEach(dataDirDestroy);

  it('Should execute a simple recipe', async () => {
    await dataDirAddJson('recipe', { steps : [
      { type: 'task', name: 'variables-set', parameters: { name: 'variable1', value: 'value1' } },
      { type: 'task', name: 'variables-set', parameters: { name: 'variable2', value: 'value2' } }
    ]});

    const recipe  = new Recipe('recipe');
    const context = { logger };
    await recipe.execute(context);

    expect(context.variables).to.deep.equal({ variable1: 'value1', variable2: 'value2' });
  });

  it('Should execute parameter substitution', async () => {
    await dataDirAddJson('recipe', { steps : [
      { type: 'task', name: 'variables-set', parameters: { name: 'variable1', value: 'value1' } },
      { type: 'task', name: 'variables-set', parameters: { name: 'variable2', value: 'we should see ${variable1} as value1 here' } }
    ]});

    const recipe  = new Recipe('recipe');
    const context = { logger };
    await recipe.execute(context);

    expect(context.variables).to.deep.equal({ variable1: 'value1', variable2: 'we should see value1 as value1 here' });
  });

  it('Should execute sub recipes', async () => {
    await dataDirAddJson('sub-recipe1', { steps : [
      { type: 'task', name: 'variables-set', parameters: { name: 'variable1', value: 'value1' } }
    ]});

    await dataDirAddJson('sub-recipe2', { steps : [
      { type: 'task', name: 'variables-set', parameters: { name: 'variable2', value: 'value2' } }
    ]});

    await dataDirAddJson('recipe', { steps : [
      { type: 'recipe', name: 'sub-recipe1' },
      { type: 'recipe', name: 'sub-recipe2' }
    ]});

    const recipe  = new Recipe('recipe');
    const context = { logger };
    await recipe.execute(context);

    expect(context.variables).to.deep.equal({ variable1: 'value1', variable2: 'value2' });
  });
});

const dataDir = '/tmp/mylife-home-deploy-test-recipe';

async function dataDirInit() {
  await fs.ensureDir(path.join(dataDir, 'recipes'));
  directories.configure(dataDir);
}

async function dataDirDestroy() {
  await fs.remove(dataDir);
}

async function dataDirAddJson(name, content) {
  await fs.writeFile(path.join(dataDir, 'recipes', name + '.json'), JSON.stringify(content));
}
