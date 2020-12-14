import { DefinitionResource } from 'mylife-home-ui/dist/src/model/definition';
import { UiProject, UiProjectInfo } from '../../../shared/project-manager';
import { SessionNotifier } from '../session-manager';
import { convertUiProject, uiV1 } from './format-converter/index'; // TODO: why do I need index ???
import { OpenedProject } from './opened-project';
import { Store } from './store';

export class UiProjects extends Store<UiProject> {

  async createNew(name: string) {
    const project: UiProject = {
      name,
      definition: { resources: [], windows: [], defaultWindow: {} },
      componentData: { components: [], plugins: {} }
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
      componentsCount: project.componentData.components.length
    };
  }

  openProject(name: string) {
    return new UiOpenedProject(name);
  }
}

class UiOpenedProject extends OpenedProject {
  constructor(name: string) {
    super('ui', name);
  }

  terminate() {
    super.terminate();
  }

  protected emitAllState(notifier: SessionNotifier) {
    super.emitAllState(notifier);

    // TODO
  }

  async updateWindow() {
    //await this.update();
    //this.emit('update-window')
  }

  async addResource() {

  }

  async refreshComponents() {

  }
}

function resourceBinaryLength(resource: DefinitionResource) {
  // base64 length = 4 chars represents 3 binary bytes
  return resource.data.length * 3 / 4;
}