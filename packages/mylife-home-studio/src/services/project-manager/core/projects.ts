import { PluginUsage } from '../../../../shared/component-model';
import { CoreComponentDefinition, CoreProject, CoreProjectInfo } from '../../../../shared/project-manager';
import { Store } from '../store';
import { CoreOpenedProject } from './opened-project';

export class CoreProjects extends Store<CoreProject> {

  createNew(name: string) {
    const project: CoreProject = {
      components: {},
      plugins: {},
      bindings: {},
      templates: {},
    };

    this.create(name, project);
    return name;
  }

  getProjectInfo(name: string): CoreProjectInfo {
    const project = this.getProject(name);

    const info: CoreProjectInfo = {
      instancesCount: new Set(Object.values(project.plugins).map(plugin => plugin.instanceName)).size,
      pluginsCount: Object.keys(project.plugins).length,
      templatesCount: Object.keys(project.templates).length,
      componentsCounts: {
        [PluginUsage.SENSOR]: 0,
        [PluginUsage.ACTUATOR]: 0,
        [PluginUsage.LOGIC]: 0,
        [PluginUsage.UI]: 0,
      },
      bindingsCount: 0
    };

    for (const { components, bindings } of [project, ...Object.values(project.templates)]) {
      info.bindingsCount += Object.keys(bindings).length;

      for (const component of Object.values(components)) {
        const usage = getComponentUsage(project, component.definition);
        ++info.componentsCounts[usage];
      }
    }

    return info;
  }

  openProject(name: string) {
    return new CoreOpenedProject(this, name);
  }
}

function getComponentUsage(project: CoreProject, definition: CoreComponentDefinition) {
  switch (definition.type) {
    case 'plugin':
      return project.plugins[definition.id].usage;
    case 'template':
      return PluginUsage.LOGIC;
  }
}

