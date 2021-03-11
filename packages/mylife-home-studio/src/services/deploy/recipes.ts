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
    log.debug(`loading recipes in: ${directories.recipes()}`);

    await fs.ensureDir(directories.recipes());

    for (const file of await fs.readdir(directories.recipes())) {
      const fullname = path.join(directories.recipes(), file);
      const name = path.parse(file).name;
      const config = JSON.parse(await fs.readFile(fullname, 'utf8'));

      this.recipes.set(name, config);
      log.info(`recipe loaded: ${name}`);
    }

    log.debug(`loading pins in: ${directories.pins()}`);
    
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

  setRecipe(id: string, config: RecipeConfig) {
    fs.ensureDirSync(directories.recipes());

    const fullname = path.join(directories.recipes(), id + '.json');
    const exists = fs.existsSync(fullname);
    fs.writeFileSync(fullname, JSON.stringify(config, null, 2));

    this.recipes.set(id, config);
    this.emit(exists ? 'recipe-updated' : 'recipe-created', id);
    log.info(`recipe set: ${id}`);
  }

  deleteRecipe(id: string) {
    fs.ensureDirSync(directories.recipes());

    const fullname = path.join(directories.recipes(), id + '.json');
    if (!fs.existsSync(fullname)) {
      return;
    }

    fs.unlinkSync(fullname);

    this.recipes.delete(id);
    this.pins.delete(id);
    this.emit('recipe-deleted', id);
    log.info(`recipe deleted: ${id}`);
  }

  listRecipes() {
    return Array.from(this.recipes.keys());
  }

  // no copy!
  getRecipe(id: string) {
    return this.recipes.get(id);
  }

  pinRecipe(id: string, value: boolean) {
    const oldValue = this.pins.has(id);
    if (value === oldValue) {
      return;
    }

    if (value) {
      this.pins.add(id);
    } else {
      this.pins.delete(id);
    }

    const fileName = directories.pins();
    fs.writeFileSync(fileName, JSON.stringify(Array.from(this.pins), null, 2));

    this.emit('recipe-pinned', id, value);
  }

  isPinned(id: string) {
    return this.pins.has(id);
  }
}