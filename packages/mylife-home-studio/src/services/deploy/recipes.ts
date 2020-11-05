import { EventEmitter } from 'events';
import { logger } from 'mylife-home-common';
import fs from 'fs-extra';
import path from 'path';
import * as directories from './directories';
import { RecipeConfig } from '../../../shared/deploy';

const log = logger.createLogger('mylife:home:studio:services:deploy:recipes');

export class Recipes extends EventEmitter {
  private readonly recipes = new Map<string, RecipeConfig>();

  async init() {
    // load recipes
    await fs.ensureDir(directories.recipes());

    for (const file of await fs.readdir(directories.recipes())) {
      const fullname = path.join(directories.recipes(), file);
      const name = path.parse(file).name;
      const config = JSON.parse(await fs.readFile(fullname, 'utf8'));

      this.recipes.set(name, config);
      log.info(`recipe loaded: ${name}`);
    }
  }

  async terminate() {
  }

  setRecipe(name: string, config: RecipeConfig) {
    fs.ensureDirSync(directories.recipes());

    const fullname = path.join(directories.recipes(), name + '.json');
    const exists = fs.existsSync(fullname);
    fs.writeFileSync(fullname, JSON.stringify(config));

    this.recipes.set(name, config);
    this.emit(exists ? 'recipe-updated' : 'recipe-created', name);
    log.info(`recipe set: ${name}`);
  }

  deleteRecipe(name: string) {
    fs.ensureDirSync(directories.recipes());

    const fullname = path.join(directories.recipes(), name + '.json');
    if (!fs.existsSync(fullname)) {
      return;
    }

    fs.unlinkSync(fullname);

    this.recipes.delete(name);
    this.emit('recipe-deleted', name);
    log.info(`recipe deleted: ${name}`);
  }

  listRecipes() {
    return Array.from(this.recipes.keys());
  }

  // no copy!
  getRecipe(name: string) {
    return this.recipes.get(name);
  }
}