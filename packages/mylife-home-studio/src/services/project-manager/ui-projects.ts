import {
  UiProject,
  UiProjectInfo,
  UiProjectCall,
  SetDefaultWindowUiProjectCall,
  SetUiDefaultWindowNotification,
  SetResourceUiProjectCall,
  SetUiResourceNotification,
  ClearResourceUiProjectCall,
  ClearUiResourceNotification,
  RenameResourceUiProjectCall,
  RenameUiResourceNotification,
  SetWindowUiProjectCall,
  SetUiWindowNotification,
  ClearWindowUiProjectCall,
  ClearUiWindowNotification,
  RenameWindowUiProjectCall,
  RenameUiWindowNotification,
  SetUiComponentDataNotification,
  ProjectCallResult,
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
      notifier.notify({ operation: 'set-ui-window', window } as SetUiWindowNotification);
    }
  }

  async call(callData: UiProjectCall): Promise<ProjectCallResult> {
    switch (callData.operation) {
      case 'set-default-window':
        await this.setDefaultWindow(callData as SetDefaultWindowUiProjectCall);
        break;

      case 'set-resource':
        await this.setResource(callData as SetResourceUiProjectCall);
        break;

      case 'clear-resource':
        await this.clearResource(callData as ClearResourceUiProjectCall);
        break;

      case 'rename-resource':
        await this.renameResource(callData as RenameResourceUiProjectCall);
        break;
  
      case 'set-window':
        await this.setWindow(callData as SetWindowUiProjectCall);
        break;

      case 'clear-window':
        await this.clearWindow(callData as ClearWindowUiProjectCall);
        break;

      case 'rename-window':
        await this.renameWindow(callData as RenameWindowUiProjectCall);
        break;

      default:
        throw new Error(`Unhandle call: ${callData.operation}`);

      // TODO renames propage
      // TODO: handle deletion of used objects
    }

    // by default return nothing
    return null;
  }

  private async setDefaultWindow({ defaultWindow }: SetDefaultWindowUiProjectCall) {
    await this.updateDefinition((definition) => {
      definition.defaultWindow = defaultWindow;
      this.notifyAll<SetUiDefaultWindowNotification>({ operation: 'set-ui-default-window', defaultWindow });
    });
  }

  private async setResource({ resource }: SetResourceUiProjectCall) {
    await this.updateDefinition((definition) => {
      arraySet(definition.resources, resource);
      this.notifyAll<SetUiResourceNotification>({ operation: 'set-ui-resource', resource });
    });
  }

  private async clearResource({ id }: ClearResourceUiProjectCall) {
    await this.updateDefinition((definition) => {
      arrayClear(definition.resources, id);
      this.notifyAll<ClearUiResourceNotification>({ operation: 'clear-ui-resource', id });
    });
  }

  private async renameResource({ id, newId }: RenameResourceUiProjectCall) {
    await this.updateDefinition((definition) => {
      throw new Error('TODO');
      //arrayClear(definition.resources, id);
      this.notifyAll<RenameUiResourceNotification>({ operation: 'rename-ui-resource', id, newId });
    });
  }

  private async setWindow({ window }: SetWindowUiProjectCall) {
    await this.updateDefinition((definition) => {
      arraySet(definition.windows, window);
      this.notifyAll<SetUiWindowNotification>({ operation: 'set-ui-window', window });
    });
  }

  private async clearWindow({ id }: ClearWindowUiProjectCall) {
    await this.updateDefinition((definition) => {
      arrayClear(definition.windows, id);
      this.notifyAll<ClearUiWindowNotification>({ operation: 'clear-ui-window', id });
    });
  }

  private async renameWindow({ id, newId }: RenameWindowUiProjectCall) {
    await this.updateDefinition((definition) => {
      throw new Error('TODO');
      //arrayClear(definition.windows, id);
      this.notifyAll<RenameUiWindowNotification>({ operation: 'rename-ui-window', id, newId });
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
