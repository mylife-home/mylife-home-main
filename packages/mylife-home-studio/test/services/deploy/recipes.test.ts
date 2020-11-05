import { expect } from 'chai';
import fs from 'fs-extra';
import { Recipes } from '../../../src/services/deploy/recipes';
import { TaskStepConfig } from '../../../shared/deploy';
import { setupDataDirectory } from './utils';

describe('Recipes', () => {
  beforeEach(dataDirInit);
  afterEach(dataDirDestroy);

  it('should create and retrieve a simple recipe', async () => {
    const { result, events } = await recipesScope(async (recipes) => {
      recipes.setRecipe('recipe', { steps: [{ type: 'task', name: 'variables-set', parameters: { name: 'variable1', value: 'value1' } } as TaskStepConfig] });
      return recipes.getRecipe('recipe');
    });

    expect(result).to.deep.equal({ steps: [{ type: 'task', name: 'variables-set', parameters: { name: 'variable1', value: 'value1' } }] });
    expect(events).to.deep.equal([{ name: 'recipe-created', args: ['recipe'] }]);
  });

  it('should delete a simple recipe', async () => {
    const { result, events } = await recipesScope(async (recipes) => {
      recipes.setRecipe('recipe', { steps: [{ type: 'task', name: 'variables-set', parameters: { name: 'variable1', value: 'value1' } } as TaskStepConfig] });
      recipes.deleteRecipe('recipe');
      return recipes.listRecipes();
    });

    expect(result).to.deep.equal([]);
    expect(events).to.deep.equal([
      { name: 'recipe-created', args: ['recipe'] },
      { name: 'recipe-deleted', args: ['recipe'] },
    ]);
  });

  it('should update a simple recipe', async () => {
    const { result, events } = await recipesScope(async (recipes) => {
      recipes.setRecipe('recipe', { steps: [{ type: 'task', name: 'variables-set', parameters: { name: 'variable1', value: 'value1' } } as TaskStepConfig] });
      recipes.setRecipe('recipe', { steps: [{ type: 'task', name: 'variables-set', parameters: { name: 'variable2', value: 'value2' } } as TaskStepConfig] });
      return recipes.getRecipe('recipe');
    });

    expect(result).to.deep.equal({ steps: [{ type: 'task', name: 'variables-set', parameters: { name: 'variable2', value: 'value2' } }] });
    expect(events).to.deep.equal([
      { name: 'recipe-created', args: ['recipe'] },
      { name: 'recipe-updated', args: ['recipe'] },
    ]);
  });

  it('should list recipes', async () => {
    const { result, events } = await recipesScope(async (recipes) => {
      recipes.setRecipe('recipe1', { steps: [{ type: 'task', name: 'variables-set', parameters: { name: 'variable1', value: 'value1' } } as TaskStepConfig] });
      recipes.setRecipe('recipe2', { steps: [{ type: 'task', name: 'variables-set', parameters: { name: 'variable2', value: 'value2' } } as TaskStepConfig] });
      return recipes.listRecipes();
    });

    expect(result).to.deep.equal(['recipe1', 'recipe2']);
    expect(events).to.deep.equal([
      { name: 'recipe-created', args: ['recipe1'] },
      { name: 'recipe-created', args: ['recipe2'] },
    ]);
  });

  it('should persist recipes', async () => {
    await recipesScope(async (recipes) => {
      recipes.setRecipe('recipe1', { steps: [{ type: 'task', name: 'variables-set', parameters: { name: 'variable1', value: 'value1' } } as TaskStepConfig] });
      recipes.setRecipe('recipe2', { steps: [{ type: 'task', name: 'variables-set', parameters: { name: 'variable2', value: 'value2' } } as TaskStepConfig] });
    });

    const { result } = await recipesScope(async (recipes) => {
      return recipes.listRecipes();
    });

    expect(result).to.deep.equal(['recipe1', 'recipe2']);
  });
});

const DATA_DIR = '/tmp/mylife-home-deploy-test-recipes';

async function dataDirInit() {
  await fs.ensureDir(DATA_DIR);
  setupDataDirectory(DATA_DIR);
}

async function dataDirDestroy() {
  await fs.remove(DATA_DIR);
}

class RecipesEvents {
  private readonly listeners: { [key: string]: (...args: any[]) => void } = {};
  public readonly events: { name: string; args: any[] }[] = [];

  constructor(private readonly recipes: Recipes) {
    const eventNames = ['recipe-updated', 'recipe-created', 'recipe-deleted'];
    for (const name of eventNames) {
      this.createListener(name);
    }
  }

  close() {
    for (const [name, listener] of Object.entries(this.listeners)) {
      this.recipes.removeListener(name, listener);
    }
  }

  private createListener(name: string) {
    const listener = (...args: any[]) => this.events.push({ name, args });
    this.listeners[name] = listener;
    this.recipes.on(name, listener);
  }
}

async function recipesScope<TResult>(callback: (recipes: Recipes) => Promise<TResult>) {
  const recipes = new Recipes();
  await recipes.init();
  const me = new RecipesEvents(recipes);
  try {
    const result = await callback(recipes);
    return { result, events: me.events };
  } finally {
    me.close();
    await recipes.terminate();
  }
}
