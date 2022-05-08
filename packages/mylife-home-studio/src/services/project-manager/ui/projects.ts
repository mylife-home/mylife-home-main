import { UiProject, UiProjectInfo, UiResourceData } from '../../../../shared/project-manager';
import { Store } from '../store';
import { UiOpenedProject } from './opened-project';

export class UiProjects extends Store<UiProject> {
  createNew(name: string) {
    const project: UiProject = {
      resources: {},
      styles: {},
      windows: {},
      defaultWindow: { desktop: null, mobile: null },
      components: {},
      plugins: {},
    };

    this.create(name, project);
    return name;
  }

  getProjectInfo(name: string): UiProjectInfo {
    const project = this.getProject(name);
    return {
      windowsCount: Object.keys(project.windows).length,
      resourcesCount: Object.keys(project.resources).length,
      resourcesSize: Object.values(project.resources).reduce((sum, res) => sum + resourceBinaryLength(res), 0),
      stylesCount: Object.keys(project.styles).length,
      componentsCount: Object.keys(project.components).length,
    };
  }

  openProject(name: string) {
    return new UiOpenedProject(this, name);
  }
}

function resourceBinaryLength(resource: UiResourceData) {
  // base64 length = 4 chars represents 3 binary bytes
  return (resource.data.length * 3) / 4;
}
