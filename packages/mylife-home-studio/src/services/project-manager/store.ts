import path from 'path';
import { EventEmitter } from 'events';
import fs from 'fs-extra';
import { logger } from 'mylife-home-common';
import { ProjectInfo } from '../../../shared/project-manager';

const log = logger.createLogger('mylife:home:studio:services:project-manager:store');

export abstract class Store<TProject> extends EventEmitter {
  private directory: string;
  private readonly projects = new Map<string, TProject>();

  init(directory: string) {
    this.directory = directory;

    log.debug(`init store from: ${this.directory}`);

    fs.ensureDirSync(this.directory);

    for (const file of fs.readdirSync(this.directory)) {
      const fullPath = path.join(this.directory, file);
      const name = path.parse(fullPath).name;
      const content = fs.readFileSync(fullPath, 'utf-8');
      const project = JSON.parse(content) as TProject;
      this.projects.set(name, project);
    }

    log.info(`${this.projects.size} projects loaded in store`);
  }

  protected create(name: string, project: TProject) {
    if (this.projects.has(name)) {
      throw new Error(`A project named '${name}' already exists`);
    }

    this.save(name, project);
    this.projects.set(name, project);
    this.emit('created', name);
  }

  update(name: string, updater: (project: TProject) => void) {
    const project = this.projects.get(name);
    if (!project) {
      throw new Error(`Project named '${name}' does not exist`);
    }

    updater(project);
    this.save(name, project);
    this.emit('updated', name);
  }

  duplicate(name: string, newName: string) {
    const project = this.projects.get(name);
    if (!project) {
      throw new Error(`Project named '${name}' does not exist`);
    }
    if (this.projects.has(newName)) {
      throw new Error(`A project named '${newName}' already exists`);
    }

    const newProject = clone(project);
    this.projects.set(newName, newProject);

    this.save(newName, newProject);
    this.emit('created', newName);
    return newName;
  }

  rename(oldName: string, newName: string) {
    const project = this.projects.get(oldName);
    if (!project) {
      throw new Error(`Project named '${oldName}' does not exist`);
    }
    if (this.projects.has(newName)) {
      throw new Error(`A project named '${newName}' already exists`);
    }

    this.projects.delete(oldName);
    this.projects.set(newName, project);

    // we change the name inside, so we cannot move
    fs.unlinkSync(this.projectFullPath(oldName));
    this.save(newName, project);
    this.emit('renamed', oldName, newName);
  }

  delete(name: string) {
    if (!this.projects.has(name)) {
      throw new Error(`Project named '${name}' does not exist`);
    }

    fs.unlinkSync(this.projectFullPath(name));
    this.projects.delete(name);
    this.emit('deleted', name);
  }

  private save(name: string, project: TProject) {
    const fullPath = this.projectFullPath(name);
    const content = JSON.stringify(project, null, 2);
    fs.writeFileSync(fullPath, content);
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
  abstract createNew(name: string): string;
}

function clone<T>(source: T): T {
  return JSON.parse(JSON.stringify(source));
}