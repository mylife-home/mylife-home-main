import { UiProject } from '../../../shared/project-manager';
import { convertUiProject, uiV1 } from './format-converter';
import { Store } from './store';

export class UiProjects extends Store<UiProject> {

  protected initNew(name: string): UiProject {
    return {
      name,
      definition: { resources: [], windows: [], defaultWindow: {} },
      componentData: { components: [], plugins: {} }
    };
  }

  async importV1(projectV1: uiV1.Project) {
    const project = convertUiProject(projectV1);
    await this.create(project);
  }

  // TODO

  async updateWindow() {

  }

  async addResource() {

  }

  async refreshComponents() {

  }
}
