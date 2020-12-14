import { ClearUiResourceNotification, ClearUiWindowNotification, SetUiComponentDataNotification, SetUiDefaultWindowProjectNotification, SetUiResourceNotification, SetUiWindowNotification, UiProject, UiProjectInfo } from '../../../shared/project-manager';
import { Window, DefaultWindow, Definition, DefinitionResource } from '../../../shared/ui-model';
import { SessionNotifier } from '../session-manager';
import { convertUiProject, uiV1 } from './format-converter/index'; // TODO: why do I need index ???
import { OpenedProject } from './opened-project';
import { Store } from './store';

type Mutable<T> = { -readonly [P in keyof T]: T[P] };

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
    return new UiOpenedProject(this, name);
  }
}

class UiOpenedProject extends OpenedProject {
  constructor(private readonly owner: UiProjects, name: string) {
    super('ui', name);
  }

  private async updateProject(updater: (project: UiProject) => void) {
    await this.owner.update(this.name, updater);
  }

  // https://github.com/microsoft/TypeScript/issues/24509#issuecomment-393564346
  private async updateDefinition(updater: (definition: Mutable<Definition>) => void) {
    await this.owner.update(this.name, (project) => updater(project.definition));
  }

  protected emitAllState(notifier: SessionNotifier) {
    super.emitAllState(notifier);

    const project = this.owner.getProject(this.name);

    notifier.notify({ operation: 'set-ui-default-window', defaultWindow: project.definition.defaultWindow } as SetUiDefaultWindowProjectNotification);
    notifier.notify({ operation: 'set-ui-component-data', componentData: project.componentData } as SetUiComponentDataNotification);

    for (const resource of project.definition.resources) {
      notifier.notify({ operation: 'set-ui-resource', resource } as SetUiResourceNotification);
    }

    for (const window of project.definition.windows) {
      notifier.notify({ operation: 'set-ui-window', window } as SetUiWindowNotification);
    }
  }

  async setDefaultWindow(defaultWindow: DefaultWindow) {
    await this.updateDefinition((definition) => {
      definition.defaultWindow = defaultWindow;
      this.notifyAll<SetUiDefaultWindowProjectNotification>({ operation: 'set-ui-default-window', defaultWindow });
    });
  }

  async setResource(resource: DefinitionResource) {
    await this.updateDefinition((definition) => {
      arraySet(definition.resources, resource);
      this.notifyAll<SetUiResourceNotification>({ operation: 'set-ui-resource', resource });
    });
  }

  async clearResource(id: string) {
    await this.updateDefinition((definition) => {
      arrayClear(definition.resources, id);
      this.notifyAll<ClearUiResourceNotification>({ operation: 'clear-ui-resource', id });
    });
  }

  async setWindow(window: Window) {
    await this.updateDefinition((definition) => {
      arraySet(definition.windows, window);
      this.notifyAll<SetUiWindowNotification>({ operation: 'set-ui-window', window });
    });
  }

  async clearWindow(id: string) {
    await this.updateDefinition((definition) => {
      arrayClear(definition.windows, id);
      this.notifyAll<ClearUiWindowNotification>({ operation: 'clear-ui-window', id });
    });
  }

  // TODO
  async refreshComponents() {

  }

}

function resourceBinaryLength(resource: DefinitionResource) {
  // base64 length = 4 chars represents 3 binary bytes
  return resource.data.length * 3 / 4;
}

interface WithId {
  readonly id: string;
}

function arraySet<T extends WithId>(array: T[], item: T) {
  const index = array.findIndex(({ id }) => id === item.id);
  if (index === -1) {
    array.push(item);
  } else {
    array[index] = item;
  }
}

function arrayClear<T extends WithId>(array: T[], id: string) {
  const index = array.findIndex(item => item.id === id);
  if (index !== -1) {
    array.splice(index, 1);
  }
}