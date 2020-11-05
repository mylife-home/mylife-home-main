import { EventEmitter } from 'events';
import fs from 'fs-extra';
import path from 'path';
import { logger } from 'mylife-home-common';
import * as directories from './directories';
import { RecipeConfig } from '../../../shared/deploy';

const log = logger.createLogger('mylife:home:studio:services:deploy:recipes');

export class Recipes extends EventEmitter {
  private readonly recipes = new Map<string, RecipeConfig>();
  private readonly pins = new Set<string>();

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

    // load pins
    const fileName = directories.pins();
    if (await fs.pathExists(fileName)) {
      const arr: string[] = JSON.parse(await fs.readFile(fileName, 'utf8'));
      for (const name of arr) {
        if (this.recipes.has(name)) {
          this.pins.add(name);
        }
      }

      log.info('pinned recipes list loaded');
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
    this.pins.delete(name);
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

  pinRecipe(name: string, value: boolean) {
    const oldValue = this.pins.has(name);
    if (value === oldValue) {
      return;
    }

    if (value) {
      this.pins.add(name);
    } else {
      this.pins.delete(name);
    }

    const fileName = directories.pins();
    fs.writeFileSync(fileName, JSON.stringify(Array.from(this.pins)));

    this.emit('recipe-pinned', name, value);
  }

  isPinned(name: string) {
    return this.pins.has(name);
  }
}