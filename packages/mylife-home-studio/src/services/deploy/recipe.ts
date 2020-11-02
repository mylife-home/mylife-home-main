import fs from 'fs';
import path from 'path';
import tasks, { TaskDefinition } from './tasks';
import * as vfs from './engine/vfs';
import { createLogger, TaskParameters } from './engine/tasks-utils';
import * as directories from './directories';
import { RunLogSeverity } from './manager';

export interface RecipeConfig {
  steps: StepConfig[];
}

export interface StepConfig {
  type: string;
}

export interface TaskStepConfig extends StepConfig {
  name: string;
  parameters: TaskParameters;
}

export interface RecipeStepConfig extends StepConfig {
  name: string;
}

export interface ExecutionContext {
  logger: (category: string, severity: RunLogSeverity, message: string) => void;
  root: vfs.Directory;
  config: vfs.Directory;
  variables: { [key: string]: string };
}

export class Recipe {
  private readonly steps: Step[] = [];

  constructor(public readonly name: string) {
    const fullname = path.join(directories.recipes(), name + '.json');
    if (!fs.existsSync(fullname)) {
      throw new Error(`not such recipe : ${name}`);
    }

    const { steps } = JSON.parse(fs.readFileSync(fullname, 'utf8')) as RecipeConfig;

    for (const step of steps) {
      const StepType = STEP_BY_TYPE[step.type];
      if (!StepType) {
        throw new Error(`Unknown step type : ${step.type}`);
      }

      this.steps.push(new StepType(step));
    }
  }

  async execute(context: ExecutionContext) {
    const log = createLogger(context, 'recipe');
    log.info(`begin '${this.name}'`);

    for (const step of this.steps) {
      await step.execute(context);
    }

    log.info(`end '${this.name}'`);
  }
}

abstract class Step {
  abstract execute(context: ExecutionContext): Promise<void>;
}

class TaskStep extends Step {
  private readonly task: TaskDefinition;
  private readonly parameters: TaskParameters;

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

  async execute(context: ExecutionContext) {
    const replaces = Object.entries(context.variables || {}).map(([name, value]) => ({
      regex: new RegExp(`\\$\\{${name}\\}`, 'g'),
      value,
    }));

    const formattedParams: TaskParameters = {};
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

  async execute(context: ExecutionContext) {
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
