import { UiProject, UiProjectInfo } from '../../../../shared/project-manager';
import { DefinitionResource } from '../../../../shared/ui-model';
import { convertUiProject, uiV1 } from './converter';
import { Store } from '../store';
import { UiOpenedProject } from './opened-project';

export class UiProjects extends Store<UiProject> {
  async createNew(name: string) {
    const project: UiProject = {
      name,
      definition: { resources: [], windows: [], defaultWindow: {} },
      componentData: { components: [], plugins: {} },
    };

    await this.create(project);
    return project.name;
  }

  async importV1(projectV1: uiV1.Project) {
    const project = convertUiProject(projectV1);
    await this.create(project);
    return project.name;
  }

  getProjectInfo(name: string): UiProjectInfo {
    const project = this.getProject(name);
    return {
      windowsCount: project.definition.windows.length,
      resourcesCount: project.definition.resources.length,
      resourcesSize: project.definition.resources.reduce((sum, res) => sum + resourceBinaryLength(res), 0),
      componentsCount: project.componentData.components.length,
    };
  }

  openProject(name: string) {
    return new UiOpenedProject(this, name, this.getProject(name));
  }
}

function resourceBinaryLength(resource: DefinitionResource) {
  // base64 length = 4 chars represents 3 binary bytes
  return (resource.data.length * 3) / 4;
}
