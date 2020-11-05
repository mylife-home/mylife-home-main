import { expect } from 'chai';
import path from 'path';
import fs from 'fs-extra';
import { Recipe } from '../../../src/services/deploy/recipe';
import { setupDataDirectory, createExecutionContext } from './utils';
import { RecipeStepConfig, TaskStepConfig } from '../../../shared/deploy';

describe('Recipe', () => {
  beforeEach(dataDirInit);
  afterEach(dataDirDestroy);

  it('should execute a simple recipe', async () => {
    await dataDirAddJson('recipe', {
      steps: [
        { type: 'task', task: 'variables-set', parameters: { name: 'variable1', value: 'value1' } } as TaskStepConfig,
        { type: 'task', task: 'variables-set', parameters: { name: 'variable2', value: 'value2' } } as TaskStepConfig,
      ],
    });

    const recipe = new Recipe('recipe');
    const context = createExecutionContext();
    await recipe.execute(context);

    expect(context.variables).to.deep.equal({ variable1: 'value1', variable2: 'value2' });
  });

  it('should execute parameter substitution', async () => {
    await dataDirAddJson('recipe', {
      steps: [
        { type: 'task', task: 'variables-set', parameters: { name: 'variable1', value: 'value1' } } as TaskStepConfig,
        { type: 'task', task: 'variables-set', parameters: { name: 'variable2', value: 'we should see ${variable1} as value1 here' } } as TaskStepConfig,
      ],
    });

    const recipe = new Recipe('recipe');
    const context = createExecutionContext();
    await recipe.execute(context);

    expect(context.variables).to.deep.equal({ variable1: 'value1', variable2: 'we should see value1 as value1 here' });
  });

  it('should execute sub recipes', async () => {
    await dataDirAddJson('sub-recipe1', { steps: [{ type: 'task', task: 'variables-set', parameters: { name: 'variable1', value: 'value1' } } as TaskStepConfig] });

    await dataDirAddJson('sub-recipe2', { steps: [{ type: 'task', task: 'variables-set', parameters: { name: 'variable2', value: 'value2' } } as TaskStepConfig] });

    await dataDirAddJson('recipe', {
      steps: [
        { type: 'recipe', recipe: 'sub-recipe1' } as RecipeStepConfig,
        { type: 'recipe', recipe: 'sub-recipe2' } as RecipeStepConfig,
      ],
    });

    const recipe = new Recipe('recipe');
    const context = createExecutionContext();
    await recipe.execute(context);

    expect(context.variables).to.deep.equal({ variable1: 'value1', variable2: 'value2' });
  });
});

const dataDir = '/tmp/mylife-home-deploy-test-recipe';

async function dataDirInit() {
  await fs.ensureDir(path.join(dataDir, 'recipes'));
  setupDataDirectory(dataDir);
}

async function dataDirDestroy() {
  await fs.remove(dataDir);
}

async function dataDirAddJson(name: string, content: any) {
  await fs.writeFile(path.join(dataDir, 'recipes', name + '.json'), JSON.stringify(content));
}
