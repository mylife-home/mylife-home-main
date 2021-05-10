import { CoreProject, CoreProjectInfo } from '../../../../shared/project-manager';
import { Store } from '../store';
import { convertCoreProject, coreV1 } from './converter';
import { CoreOpenedProject } from './opened-project';

export class CoreProjects extends Store<CoreProject> {

  createNew(name: string) {
    const project: CoreProject = {
      name,
      components: {},
      plugins: {},
      bindings: {},
    };

    this.create(project);
    return project.name;
  }

  importV1(projectV1: coreV1.Project) {
    const project = convertCoreProject(projectV1);
    this.create(project);
    return project.name;
  }

  getProjectInfo(name: string): CoreProjectInfo {
    const project = this.getProject(name);
    return {
      instancesCount: new Set(Object.values(project.plugins).map(plugin => plugin.instanceName)).size,
      componentsCount: Object.keys(project.components).length,
      pluginsCount: Object.keys(project.plugins).length,
      bindingsCount: Object.keys(project.bindings).length,
    };
  }

  openProject(name: string) {
    return new CoreOpenedProject(this, name, this.getProject(name));
  }
}
