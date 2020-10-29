import fs from 'fs';
import path from 'path';
import tasks from './tasks';
import utils from './tasks-utils';
const directories = require('../directories');

interface StepConfig {
  type: string;
}

interface TaskStepConfig extends StepConfig {
  name: string;
}

interface RecipeStepConfig extends StepConfig {
  name: string;
}

interface Context {}

export class Recipe {
  private readonly steps: Step[] = [];

  constructor(public readonly name: string) {
    const fullname = path.join(directories.recipes(), name + '.json');
    if (!fs.existsSync(fullname)) {
      throw new Error(`not such recipe : ${name}`);
    }

    const { steps } = JSON.parse(fs.readFileSync(fullname, 'utf8')) as { steps: StepConfig[] };

    for (const step of steps) {
      const StepType = STEP_BY_TYPE[step.type];
      if (!StepType) {
        throw new Error(`Unknown step type : ${step.type}`);
      }

      this.steps.push(new StepType(step));
    }
  }

  async execute(context: Context) {
    const log = utils.createLogger(context, 'recipe');
    log.info(`begin '${this.name}'`);

    for (const step of this.steps) {
      await step.execute(context);
    }

    log.info(`end '${this.name}'`);
  }
}

abstract class Step {
  abstract execute(context: Context): Promise<void>;
}

class TaskStep extends Step {
  constructor(config: TaskStepConfig) {
    super();

    const task = tasks[makeUpperCamelCase(config.name)];
    if (!task) {
      throw new Error(`Task does not exist : ${config.name}`);
    }

    this.task = task;
    this.parameters = Object.assign({}, config.parameters);

    for (const def of task.metadata.parameters) {
      const type = typeof this.parameters[def.name];
      if (type !== 'undefined') {
        if (type !== def.type) {
          throw new Error(`Bad parameter type : ${def.name}`);
        }

        continue;
      }

      if (typeof def.default !== 'undefined') {
        this.parameters[def.name] = def.default;
        continue;
      }

      throw new Error(`Missing parameter : ${def.name}`);
    }
  }

  async execute(context: Context) {
    const replaces = Object.entries(context.variables || {}).map(([name, value]) => ({
      regex: new RegExp(`\\$\\{${name}\\}`, 'g'),
      value,
    }));

    const formattedParams = {};
    for (const [name, value] of Object.entries(this.parameters)) {
      let newValue = value;
      for (const rep of replaces) {
        newValue = newValue.replace(rep.regex, rep.value);
      }
      formattedParams[name] = newValue;
    }

    await this.task.execute(context, formattedParams);
  }
}

class RecipeStep extends Step {
  private readonly recipe: Recipe;

  constructor(config: RecipeStepConfig) {
    super();

    this.recipe = new Recipe(config.name);
  }

  async execute(context: Context) {
    await this.recipe.execute(context);
  }
}

type StepConstructor = new (config: any) => Step;

const STEP_BY_TYPE: { [key: string]: StepConstructor } = {
  task: TaskStep,
  recipe: RecipeStep,
};

function makeUpperCamelCase(name: string) {
  return name
    .split('-')
    .map((part) => part[0].toUpperCase() + part.substring(1))
    .join('');
}
