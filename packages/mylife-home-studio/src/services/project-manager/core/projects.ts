import { PluginUsage } from '../../../../shared/component-model';
import { CoreProject, CoreProjectInfo } from '../../../../shared/project-manager';
import { Store } from '../store';
import { convertCoreProject, coreV1 } from './converter';
import { CoreOpenedProject } from './opened-project';

export class CoreProjects extends Store<CoreProject> {

  createNew(name: string) {
    const project: CoreProject = {
      components: {},
      plugins: {},
      bindings: {},
    };

    this.create(name, project);
    return name;
  }

  importV1(projectV1: coreV1.Project) {
    const { name, project } = convertCoreProject(projectV1);
    this.create(name, project);
    return name;
  }

  getProjectInfo(name: string): CoreProjectInfo {
    const project = this.getProject(name);
    return {
      instancesCount: new Set(Object.values(project.plugins).map(plugin => plugin.instanceName)).size,
      componentsCounts: getComponentsCounts(project),
      pluginsCount: Object.keys(project.plugins).length,
      bindingsCount: Object.keys(project.bindings).length,
    };
  }

  openProject(name: string) {
    return new CoreOpenedProject(this, name);
  }
}

function getComponentsCounts(project: CoreProject) {
  const counts: { [usage in PluginUsage]: number } = {
    [PluginUsage.SENSOR]: 0,
    [PluginUsage.ACTUATOR]: 0,
    [PluginUsage.LOGIC]: 0,
    [PluginUsage.UI]: 0,
  };

  for (const id of  Object.keys(project.components)) {
    const usage = getComponentUsage(project, id);
    ++counts[usage];
  }

  return counts;
}

function getComponentUsage(project: CoreProject, id: string) {
  const component = project.components[id];
  const plugin = project.plugins[component.plugin];
  return plugin.usage;
}

