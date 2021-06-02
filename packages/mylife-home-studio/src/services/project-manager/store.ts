import { EventEmitter } from 'events';
import { ProjectInfo } from '../../../shared/project-manager';
import { ChangeType, FsCollection } from '../../utils/fs-collection';
import { clone } from '../../utils/object-utils';

export abstract class Store<TProject> extends EventEmitter {
  private readonly projects = new FsCollection<TProject>();

  constructor() {
    super();

    this.projects.on('create', this.handleCreate);
    this.projects.on('update', this.handleUpdate);
    this.projects.on('delete', this.handleDelete);
    this.projects.on('rename', this.handleRename);
  }

  init(directory: string) {
    this.projects.init(directory);
  }

  async terminate() {
    await this.projects.terminate();
  }

  private readonly handleCreate = (id: string, type: ChangeType) => {
    this.emit('created', id);
  };

  private readonly handleUpdate = (id: string, type: ChangeType) => {
    this.emit('updated', id);

    if(type === 'external') {
      this.emit('updated-external', id);
    }
  };

  private readonly handleDelete = (id: string, type: ChangeType) => {
    this.emit('deleted', id);
  };

  private readonly handleRename = (id: string, newId: string, type: ChangeType) => {
    this.emit('renamed', id, newId);
  };

  protected create(name: string, project: TProject) {
    this.projects.create(name, project);
  }

  update<TResult>(name: string, updater: (project: TProject) => TResult) {
    const project = this.projects.get(name);
    if (!project) {
      throw new Error(`Project named '${name}' does not exist`);
    }

    const result = updater(project);
    this.projects.update(name, project);

    return result;
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
    this.projects.create(newName, newProject);
    return newName;
  }

  rename(oldName: string, newName: string) {
    this.projects.rename(oldName, newName);
  }

  delete(name: string) {
    this.projects.delete(name);
  }

  getProjectsNames() {
    return Array.from(this.projects.ids());
  }

  getProjects() {
    return this.projects.ids().map(id => this.projects.get(id));
  }

  getProject(name: string) {
    return this.projects.get(name);
  }

  abstract getProjectInfo(name: string): ProjectInfo;
  abstract createNew(name: string): string;
}
