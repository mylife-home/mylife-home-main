import {
  UiProject,
  UiProjectInfo,
  UiProjectUpdate,
  ClearResourceUiProjectUpdate,
  ClearWindowUiProjectUpdate,
  SetDefaultWindowUiProjectUpdate,
  SetResourceUiProjectUpdate,
  SetWindowUiProjectUpdate,
  ClearUiResourceNotification,
  ClearUiWindowNotification,
  SetUiComponentDataNotification,
  SetUiDefaultWindowNotification,
  SetUiResourceNotification,
  SetUiWindowNotification,
  SetUiControlNotification,
} from '../../../shared/project-manager';
import { Definition, DefinitionResource } from '../../../shared/ui-model';
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
    await this.updateProject((project) => updater(project.definition));
  }

  protected emitAllState(notifier: SessionNotifier) {
    super.emitAllState(notifier);

    const project = this.owner.getProject(this.name);

    notifier.notify({ operation: 'set-ui-default-window', defaultWindow: project.definition.defaultWindow } as SetUiDefaultWindowNotification);
    notifier.notify({ operation: 'set-ui-component-data', componentData: project.componentData } as SetUiComponentDataNotification);

    for (const resource of project.definition.resources) {
      notifier.notify({ operation: 'set-ui-resource', resource } as SetUiResourceNotification);
    }

    for (const window of project.definition.windows) {
      const { controls, ...windowOnly } = window;
      notifier.notify({ operation: 'set-ui-window', window: windowOnly } as SetUiWindowNotification);

      for (const control of controls) {
        notifier.notify({ operation: 'set-ui-control', windowId: window.id, control } as SetUiControlNotification);
      }
    }
  }

  async update(updateData: UiProjectUpdate) {
    switch (updateData.operation) {
      case 'set-default-window':
        await this.setDefaultWindow(updateData as SetDefaultWindowUiProjectUpdate);
        break;

      case 'set-resource':
        await this.setResource(updateData as SetResourceUiProjectUpdate);
        break;

      case 'clear-resource':
        await this.clearResource(updateData as ClearResourceUiProjectUpdate);
        break;

      case 'set-window':
        await this.setWindow(updateData as SetWindowUiProjectUpdate);
        break;

      case 'clear-window':
        await this.clearWindow(updateData as ClearWindowUiProjectUpdate);
        break;

      default:
        throw new Error(`Unhandle update operation: ${updateData.operation}`);

      // TODO renames (+ propage)
      // TODO controls
      // TODO: handle deletion of used objects
    }
  }

  private async setDefaultWindow({ defaultWindow }: SetDefaultWindowUiProjectUpdate) {
    await this.updateDefinition((definition) => {
      definition.defaultWindow = defaultWindow;
      this.notifyAll<SetUiDefaultWindowNotification>({ operation: 'set-ui-default-window', defaultWindow });
    });
  }

  private async setResource({ resource }: SetResourceUiProjectUpdate) {
    await this.updateDefinition((definition) => {
      arraySet(definition.resources, resource);
      this.notifyAll<SetUiResourceNotification>({ operation: 'set-ui-resource', resource });
    });
  }

  private async clearResource({ id }: ClearResourceUiProjectUpdate) {
    await this.updateDefinition((definition) => {
      arrayClear(definition.resources, id);
      this.notifyAll<ClearUiResourceNotification>({ operation: 'clear-ui-resource', id });
    });
  }

  private async setWindow({ window }: SetWindowUiProjectUpdate) {
    await this.updateDefinition((definition) => {
      arraySet(definition.windows, window);
      this.notifyAll<SetUiWindowNotification>({ operation: 'set-ui-window', window });
    });
  }

  private async clearWindow({ id }: ClearWindowUiProjectUpdate) {
    await this.updateDefinition((definition) => {
      arrayClear(definition.windows, id);
      this.notifyAll<ClearUiWindowNotification>({ operation: 'clear-ui-window', id });
    });
  }

  // TODO
  private async refreshComponents() {}
}

function resourceBinaryLength(resource: DefinitionResource) {
  // base64 length = 4 chars represents 3 binary bytes
  return (resource.data.length * 3) / 4;
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
  const index = array.findIndex((item) => item.id === id);
  if (index !== -1) {
    array.splice(index, 1);
  }
}
