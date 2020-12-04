import path from 'path';
import { EventEmitter } from 'events';
import fs from 'fs-extra';
import { Mutex } from 'async-mutex';
import { logger } from 'mylife-home-common';
import { ProjectInfo } from '../../../shared/project-manager';

const log = logger.createLogger('mylife:home:studio:services:project-manager:store');

export interface ProjectBase {
  name: string;
}

export abstract class Store<TProject extends ProjectBase> extends EventEmitter {
  private directory: string;
  private readonly projects = new Map<string, TProject>();
  private readonly mutex = new Mutex();

  async init(directory: string) {
    this.directory = directory;

    log.debug(`init store from: ${this.directory}`);

    await fs.ensureDir(this.directory);

    for (const file of await fs.readdir(this.directory)) {
      const fullPath = path.join(this.directory, file);
      const content = await fs.readFile(fullPath, 'utf-8');
      const project = JSON.parse(content) as TProject;
      this.projects.set(project.name, project);
    }

    log.info(`${this.projects.size} projects loaded in store`);
  }

  protected async create(project: TProject) {
    await this.mutex.runExclusive(async () => {
      if (this.projects.has(project.name)) {
        throw new Error(`A project named '${project.name}' already exists`);
      }

      await this.save(project);
      this.projects.set(name, project);
      this.emit('created', name);
    });
  }

  protected async update(name: string, updater: (project: TProject) => void) {
    await this.mutex.runExclusive(async () => {
      const project = this.projects.get(name);
      if (!project) {
        throw new Error(`Project named '${name}' does not exist`);
      }

      updater(project);
      await this.save(project);
      this.emit('updated', name);
    });
  }

  async rename(oldName: string, newName: string) {
    await this.mutex.runExclusive(async () => {
      const project = this.projects.get(oldName);
      if (!project) {
        throw new Error(`Project named '${oldName}' does not exist`);
      }
      if (this.projects.has(newName)) {
        throw new Error(`A project named '${newName}' already exists`);
      }

      this.projects.delete(oldName);
      this.projects.set(newName, project);
      project.name = newName;

      // we change the name inside, so we cannot move
      await fs.unlink(this.projectFullPath(oldName));
      await this.save(project);
      this.emit('renamed', oldName, newName);
    });
  }

  async delete(name: string) {
    await this.mutex.runExclusive(async () => {
      if (!this.projects.has(name)) {
        throw new Error(`Project named '${name}' does not exist`);
      }

      await fs.unlink(this.projectFullPath(name));
      this.projects.delete(name);
      this.emit('deleted', name);
    });
  }

  private async save(project: TProject) {
    const fullPath = this.projectFullPath(project.name);
    const content = JSON.stringify(project);
    await fs.writeFile(fullPath, content);
  }

  private projectFullPath(name: string) {
    return path.join(this.directory, name + '.json');
  }

  getProjectsNames() {
    return Array.from(this.projects.keys());
  }

  getProjects() {
    return Array.from(this.projects.values());
  }

  getProject(name: string) {
    const project = this.projects.get(name);
    if (!project) {
      throw new Error(`Project named '${name}' does not exist`);
    }

    return project;
  }

  abstract getProjectInfo(name: string): ProjectInfo;
  abstract createNew(name: string): Promise<void>;
}
