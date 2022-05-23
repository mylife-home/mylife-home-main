import { logger } from 'mylife-home-common';
import {
  UiProject,
  UiProjectCall,
  SetDefaultWindowUiProjectCall,
  SetUiDefaultWindowNotification,
  SetResourceUiProjectCall,
  SetUiResourceNotification,
  ClearResourceUiProjectCall,
  ClearUiResourceNotification,
  RenameResourceUiProjectCall,
  RenameUiResourceNotification,
  SetUiWindowNotification,
  ClearWindowUiProjectCall,
  ClearUiWindowNotification,
  RenameWindowUiProjectCall,
  RenameUiWindowNotification,
  CloneWindowUiProjectCall,
  ClearControlUiProjectCall,
  RenameControlUiProjectCall,
  SetUiComponentDataNotification,
  ProjectCallResult,
  ValidateUiProjectCallResult,
  RefreshComponentsFromProjectUiProjectCall,
  RefreshComponentsUiProjectCallResult,
  ApplyRefreshComponentsUiProjectCall,
  DeployUiProjectCallResult,
  NewWindowUiProjectCall,
  SetWindowPropertiesUiProjectCall,
  NewControlUiProjectCall,
  SetControlPropertiesUiProjectCall,
  CloneControlUiProjectCall,
  SetStyleUiProjectCall,
  ClearStyleUiProjectCall,
  RenameStyleUiProjectCall,
  SetUiStyleNotification,
  ClearUiStyleNotification,
  RenameUiStyleNotification,
  SetUiTemplateNotification,
  ClearTemplateUiProjectCall,
  NewTemplateUiProjectCall,
  RenameTemplateUiProjectCall,
  RenameUiTemplateNotification,
  ClearUiTemplateNotification,
  CloneTemplateUiProjectCall,
  SetTemplatePropertiesUiProjectCall,
  SetTemplateExportUiProjectCall,
  ClearTemplateExportUiProjectCall,
  NewTemplateInstanceUiProjectCall,
  ClearTemplateInstanceUiProjectCall,
  RenameTemplateInstanceUiProjectCall,
  CloneTemplateInstanceUiProjectCall,
  MoveTemplateInstanceUiProjectCall,
  SetTemplateInstanceTemplateUiProjectCall,
  SetTemplateInstanceBindingUiProjectCall,
} from '../../../../shared/project-manager';
import { SessionNotifier } from '../../session-manager';
import { OpenedProject } from '../opened-project';
import { Services } from '../..';
import { UiProjects } from './projects';
import { loadCoreProjectComponentData, loadOnlineComponentData, NewComponentData, prepareMergeComponentData } from './component-model';
import { WindowModel, ResourceModel, ComponentUsage, StyleModel, TemplateModel, ProjectModel, ViewModel } from './definition-model';
import { buildDeployDefinition } from './deploy';

const log = logger.createLogger('mylife:home:studio:services:project-manager:ui:opened-project');

interface RefreshServerData {
  componentData: NewComponentData;
  usageToClear: ComponentUsage[];
}

export class UiOpenedProject extends OpenedProject {
  private model: ProjectModel;
  private project: UiProject;

  constructor(private readonly owner: UiProjects, name: string) {
    super('ui', name);
    this.reloadModel();
  }

  protected reloadModel() {
    this.project = this.owner.getProject(this.name);
    this.model = new ProjectModel(this.project);
  }

  protected emitAllState(notifier: SessionNotifier) {
    super.emitAllState(notifier);

    notifier.notify({ operation: 'set-ui-default-window', defaultWindow: this.project.defaultWindow } as SetUiDefaultWindowNotification);
    notifier.notify({ operation: 'set-ui-component-data', components: this.project.components, plugins: this.project.plugins } as SetUiComponentDataNotification);

    for (const [id, resource] of Object.entries(this.project.resources)) {
      notifier.notify({ operation: 'set-ui-resource', id, resource } as SetUiResourceNotification);
    }

    for (const [id, style] of Object.entries(this.project.styles)) {
      notifier.notify({ operation: 'set-ui-style', id, style } as SetUiStyleNotification);
    }

    for (const [id, window] of Object.entries(this.project.windows)) {
      notifier.notify({ operation: 'set-ui-window', id, window } as SetUiWindowNotification);
    }

    for (const [id, template] of Object.entries(this.project.templates)) {
      notifier.notify({ operation: 'set-ui-template', id, template } as SetUiTemplateNotification);
    }
  }

  async call(callData: UiProjectCall): Promise<ProjectCallResult> {
    switch (callData.operation) {
      case 'validate':
        return this.validate();

      case 'refresh-components-from-online':
        return this.refreshComponentsFromOnline();

      case 'refresh-components-from-project':
        return this.refreshComponentsFromProject(callData as RefreshComponentsFromProjectUiProjectCall);

      case 'apply-refresh-components':
        this.applyRefreshComponents(callData as ApplyRefreshComponentsUiProjectCall);
        break;

      case 'deploy':
        return await this.deploy();

      case 'set-default-window':
        this.setDefaultWindow(callData as SetDefaultWindowUiProjectCall);
        break;

      case 'set-resource':
        this.setResource(callData as SetResourceUiProjectCall);
        break;

      case 'clear-resource':
        this.clearResource(callData as ClearResourceUiProjectCall);
        break;

      case 'rename-resource':
        this.renameResource(callData as RenameResourceUiProjectCall);
        break;

      case 'set-style':
        this.setStyle(callData as SetStyleUiProjectCall);
        break;

      case 'clear-style':
        this.clearStyle(callData as ClearStyleUiProjectCall);
        break;

      case 'rename-style':
        this.renameStyle(callData as RenameStyleUiProjectCall);
        break;

      case 'new-window':
        this.newWindow(callData as NewWindowUiProjectCall);
        break;

      case 'clear-window':
        this.clearWindow(callData as ClearWindowUiProjectCall);
        break;

      case 'rename-window':
        this.renameWindow(callData as RenameWindowUiProjectCall);
        break;

      case 'clone-window':
        this.cloneWindow(callData as CloneWindowUiProjectCall);
        break;
  
      case 'set-window-properties':
        this.setWindowProperties(callData as SetWindowPropertiesUiProjectCall);
        break;

      case 'new-template':
        this.newTemplate(callData as NewTemplateUiProjectCall);
        break;

      case 'clear-template':
        this.clearTemplate(callData as ClearTemplateUiProjectCall);
        break;

      case 'rename-template':
        this.renameTemplate(callData as RenameTemplateUiProjectCall);
        break;

      case 'clone-template':
        this.cloneTemplate(callData as CloneTemplateUiProjectCall);
        break;
  
      case 'set-template-properties':
        this.setTemplateProperties(callData as SetTemplatePropertiesUiProjectCall);
        break;

      case 'set-template-export':
        this.setTemplateExport(callData as SetTemplateExportUiProjectCall);
        break;

      case 'clear-template-export':
        this.clearTemplateExport(callData as ClearTemplateExportUiProjectCall);
        break;
    
      case 'new-control':
        this.newControl(callData as NewControlUiProjectCall);
        break;

      case 'clear-control':
        this.clearControl(callData as ClearControlUiProjectCall);
        break;

      case 'rename-control':
        this.renameControl(callData as RenameControlUiProjectCall);
        break;
        
      case 'clone-control':
        this.cloneControl(callData as CloneControlUiProjectCall);
        break;
  
      case 'set-control-properties':
        this.setControlProperties(callData as SetControlPropertiesUiProjectCall);
        break;

      case 'new-template-instance':
        this.newTemplateInstance(callData as NewTemplateInstanceUiProjectCall);
        break;

      case 'clear-template-instance':
        this.clearTemplateInstance(callData as ClearTemplateInstanceUiProjectCall);
        break;

      case 'rename-template-instance':
        this.renameTemplateInstance(callData as RenameTemplateInstanceUiProjectCall);
        break;
        
      case 'clone-template-instance':
        this.cloneTemplateInstance(callData as CloneTemplateInstanceUiProjectCall);
        break;
  
      case 'move-template-instance':
        this.moveTemplateInstanceProperties(callData as MoveTemplateInstanceUiProjectCall);
        break;
  
      case 'set-template-instance-template':
        this.setTemplateInstanceTemplate(callData as SetTemplateInstanceTemplateUiProjectCall);
        break;
  
      case 'set-template-instance-binding':
        this.setTemplateInstanceBinding(callData as SetTemplateInstanceBindingUiProjectCall);
        break;
      
      default:
        throw new Error(`Unhandled call: ${callData.operation}`);
    }

    // by default return nothing
    return null;
  }

  private executeUpdate<TResult>(updater: () => TResult) {
    return this.owner.update(this.name, updater);
  }

  private notifyAllDefaultWindow() {
    this.notifyAll<SetUiDefaultWindowNotification>({ operation: 'set-ui-default-window', defaultWindow: this.model.defaultWindow.data });
  }

  private notifyAllWindow(window: WindowModel) {
    this.notifyAll<SetUiWindowNotification>({ operation: 'set-ui-window', id: window.id, window: window.data });
  }

  private notifyAllTemplate(template: TemplateModel) {
    this.notifyAll<SetUiTemplateNotification>({ operation: 'set-ui-template', id: template.id, template: template.data });
  }

  private notifyAllView(view: ViewModel) {
    if (view instanceof WindowModel) {
      this.notifyAllWindow(view);
    } else if (view instanceof TemplateModel) {
      this.notifyAllTemplate(view);
    }
  }

  private notifyAllComponentData() {
    this.notifyAll<SetUiComponentDataNotification>({ operation: 'set-ui-component-data', components: this.project.components, plugins: this.project.plugins });
  }

  private notifyAllResource(resource: ResourceModel) {
    this.notifyAll<SetUiResourceNotification>({ operation: 'set-ui-resource', id: resource.id, resource: resource.data });
  }

  private notifyAllStyle(style: StyleModel) {
    this.notifyAll<SetUiStyleNotification>({ operation: 'set-ui-style', id: style.id, style: style.data });
  }

  private setDefaultWindow({ defaultWindow }: SetDefaultWindowUiProjectCall) {
    this.executeUpdate(() => {
      this.model.setDefaultWindow(defaultWindow);
      this.notifyAllDefaultWindow();
    });
  }

  private setResource({ id, resource }: SetResourceUiProjectCall) {
    this.executeUpdate(() => {
      const resourceModel = this.model.setResource(id, resource);
      this.notifyAllResource(resourceModel);
    });
  }

  private clearResource({ id }: ClearResourceUiProjectCall) {
    this.executeUpdate(() => {
      const impacts = this.model.clearResource(id);

      this.notifyAll<ClearUiResourceNotification>({ operation: 'clear-ui-resource', id });

      for (const window of impacts.windows) {
        this.notifyAllWindow(window);
      }

      for (const template of impacts.templates) {
        this.notifyAllTemplate(template);
      }
    });
  }

  private renameResource({ id, newId }: RenameResourceUiProjectCall) {
    this.executeUpdate(() => {
      const impacts = this.model.renameResource(id, newId);

      this.notifyAll<RenameUiResourceNotification>({ operation: 'rename-ui-resource', id, newId });

      for (const window of impacts.windows) {
        this.notifyAllWindow(window);
      }

      for (const template of impacts.templates) {
        this.notifyAllTemplate(template);
      }
    });
  }

  private setStyle({ id, style }: SetStyleUiProjectCall) {
    this.executeUpdate(() => {
      const styleModel = this.model.setStyle(id, style);
      this.notifyAllStyle(styleModel);
    });
  }

  private clearStyle({ id }: ClearStyleUiProjectCall) {
    this.executeUpdate(() => {
      const impacts = this.model.clearStyle(id);

      this.notifyAll<ClearUiStyleNotification>({ operation: 'clear-ui-style', id });

      for (const window of impacts.windows) {
        this.notifyAllWindow(window);
      }
    });
  }

  private renameStyle({ id, newId }: RenameStyleUiProjectCall) {
    this.executeUpdate(() => {
      const impacts = this.model.renameStyle(id, newId);

      this.notifyAll<RenameUiStyleNotification>({ operation: 'rename-ui-style', id, newId });

      for (const window of impacts.windows) {
        this.notifyAllWindow(window);
      }
    });
  }

  private newWindow({ id }: NewWindowUiProjectCall) {
    this.executeUpdate(() => {
      const model = this.model.newWindow(id);
      this.notifyAllWindow(model);
    });
  }

  private clearWindow({ id }: ClearWindowUiProjectCall) {
    this.executeUpdate(() => {
      const impacts = this.model.clearWindow(id);

      this.notifyAll<ClearUiWindowNotification>({ operation: 'clear-ui-window', id });

      if (impacts.defaultWindow) {
        this.notifyAllDefaultWindow();
      }

      for (const window of impacts.windows) {
        this.notifyAllWindow(window);
      }

      for (const template of impacts.templates) {
        this.notifyAllTemplate(template);
      }
    });
  }

  private renameWindow({ id, newId }: RenameWindowUiProjectCall) {
    this.executeUpdate(() => {
      const impacts = this.model.renameWindow(id, newId);

      this.notifyAll<RenameUiWindowNotification>({ operation: 'rename-ui-window', id, newId });

      if (impacts.defaultWindow) {
        this.notifyAllDefaultWindow();
      }

      for (const window of impacts.windows) {
        this.notifyAllWindow(window);
      }

      for (const template of impacts.templates) {
        this.notifyAllTemplate(template);
      }
    });
  }

  private cloneWindow({ id, newId }: CloneWindowUiProjectCall) {
    this.executeUpdate(() => {
      const model = this.model.cloneWindow(id, newId);
      this.notifyAllWindow(model);
    });
  }

  private setWindowProperties({ id, properties }: SetWindowPropertiesUiProjectCall) {
    this.executeUpdate(() => {
      const windowModel = this.model.getWindow(id);
      windowModel.update(properties);
      this.notifyAllWindow(windowModel);
    });
  }

  private newTemplate({ id }: NewTemplateUiProjectCall) {
    this.executeUpdate(() => {
      const model = this.model.newTemplate(id);
      this.notifyAllTemplate(model);
    });
  }

  private clearTemplate({ id }: ClearTemplateUiProjectCall) {
    this.executeUpdate(() => {
      const impacts = this.model.clearTemplate(id);

      this.notifyAll<ClearUiTemplateNotification>({ operation: 'clear-ui-template', id });

      for (const window of impacts.windows) {
        this.notifyAllWindow(window);
      }

      for (const template of impacts.templates) {
        this.notifyAllTemplate(template);
      }
    });
  }

  private renameTemplate({ id, newId }: RenameTemplateUiProjectCall) {
    this.executeUpdate(() => {
      const impacts = this.model.renameTemplate(id, newId);

      this.notifyAll<RenameUiTemplateNotification>({ operation: 'rename-ui-template', id, newId });

      for (const window of impacts.windows) {
        this.notifyAllWindow(window);
      }

      for (const template of impacts.templates) {
        this.notifyAllTemplate(template);
      }
    });
  }

  private cloneTemplate({ id, newId }: CloneTemplateUiProjectCall) {
    this.executeUpdate(() => {
      const model = this.model.cloneTemplate(id, newId);
      this.notifyAllTemplate(model);
    });
  }

  private setTemplateProperties({ id, properties }: SetTemplatePropertiesUiProjectCall) {
    this.executeUpdate(() => {
      const templateModel = this.model.getTemplate(id);
      templateModel.update(properties);
      this.notifyAllTemplate(templateModel);
    });
  }

  private setTemplateExport({ id, exportId, memberType, valueType }: SetTemplateExportUiProjectCall) {
    this.executeUpdate(() => {
      const impacts = this.model.setTemplateExport(id, exportId, memberType, valueType);

      for (const window of impacts.windows) {
        this.notifyAllWindow(window);
      }

      for (const template of impacts.templates) {
        this.notifyAllTemplate(template);
      }
    });
  }

  private clearTemplateExport({ id, exportId }: ClearTemplateExportUiProjectCall) {
    this.executeUpdate(() => {
      const impacts = this.model.clearTemplateExport(id, exportId);

      for (const window of impacts.windows) {
        this.notifyAllWindow(window);
      }

      for (const template of impacts.templates) {
        this.notifyAllTemplate(template);
      }
    });
  }

  private newControl({ viewType, viewId, id, x, y, type }: NewControlUiProjectCall) {
    this.executeUpdate(() => {
      const viewModel = this.model.getView(viewType, viewId);
      viewModel.newControl(id, type, x, y);
      this.notifyAllView(viewModel);
    });
  }

  private clearControl({ viewType, viewId, id }: ClearControlUiProjectCall) {
    this.executeUpdate(() => {
      const viewModel = this.model.getView(viewType, viewId);
      viewModel.clearControl(id);
      this.notifyAllView(viewModel);
    });
  }

  private renameControl({ viewType, viewId, id, newId }: RenameControlUiProjectCall) {
    this.executeUpdate(() => {
      const viewModel = this.model.getView(viewType, viewId);
      viewModel.renameControl(id, newId);
      this.notifyAllView(viewModel);
    });
  }

  private cloneControl({ viewType, viewId, id, newId, targetViewType, targetViewId }: CloneControlUiProjectCall) {
    this.executeUpdate(() => {
      const sourceControl = this.model.getView(viewType, viewId).getControl(id);
      const targetViewModel = this.model.getView(targetViewType, targetViewId);
      targetViewModel.cloneControl(sourceControl, newId);
      this.notifyAllView(targetViewModel);
    });
  }

  private setControlProperties({ viewType, viewId, id, properties }: SetControlPropertiesUiProjectCall) {
    this.executeUpdate(() => {
      const viewModel = this.model.getView(viewType, viewId);
      const controlModel = viewModel.getControl(id);
      controlModel.update(properties);
      this.notifyAllView(viewModel);
    });
  }

  private newTemplateInstance({ viewType, viewId, id, templateId, x, y }: NewTemplateInstanceUiProjectCall) {
    this.executeUpdate(() => {
      const viewModel = this.model.getView(viewType, viewId);
      viewModel.newTemplateInstance(id, templateId, x, y);
      this.notifyAllView(viewModel);
    });
  }

  private clearTemplateInstance({ viewType, viewId, id }: ClearTemplateInstanceUiProjectCall) {
    this.executeUpdate(() => {
      const viewModel = this.model.getView(viewType, viewId);
      viewModel.clearTemplateInstance(id);
      this.notifyAllView(viewModel);
    });
  }

  private renameTemplateInstance({ viewType, viewId, id, newId }: RenameTemplateInstanceUiProjectCall) {
    this.executeUpdate(() => {
      const viewModel = this.model.getView(viewType, viewId);
      viewModel.renameTemplateInstance(id, newId);
      this.notifyAllView(viewModel);
    });
  }

  private cloneTemplateInstance({ viewType, viewId, id, newId }: CloneTemplateInstanceUiProjectCall) {
    this.executeUpdate(() => {
      const viewModel = this.model.getView(viewType, viewId);
      viewModel.cloneTemplateInstance(id, newId);
      this.notifyAllView(viewModel);
    });
  }

  private moveTemplateInstanceProperties({ viewType, viewId, id, x, y }: MoveTemplateInstanceUiProjectCall) {
    this.executeUpdate(() => {
      const viewModel = this.model.getView(viewType, viewId);
      const templateInstanceModel = viewModel.getTemplateInstance(id);
      templateInstanceModel.move(x, y);

      this.notifyAllView(viewModel);
    });
  }

  private setTemplateInstanceTemplate({ viewType, viewId, id, templateId }: SetTemplateInstanceTemplateUiProjectCall) {
    this.executeUpdate(() => {
      const viewModel = this.model.getView(viewType, viewId);
      const templateInstanceModel = viewModel.getTemplateInstance(id);
      const template = this.model.getTemplate(templateId);
      templateInstanceModel.setTemplate(template);

      this.notifyAllView(viewModel);
    });
  }

  private setTemplateInstanceBinding({ viewType, viewId, id, exportId, componentId, memberName }: SetTemplateInstanceBindingUiProjectCall) {
    this.executeUpdate(() => {
      const viewModel = this.model.getView(viewType, viewId);
      const templateInstanceModel = viewModel.getTemplateInstance(id);
      templateInstanceModel.setBinding(exportId, componentId, memberName);

      this.notifyAllView(viewModel);
    });
  }

  private validate(): ValidateUiProjectCallResult {
    const errors = this.model.validate();

    return { errors };
  }

  private refreshComponentsFromOnline(): RefreshComponentsUiProjectCallResult {
    const componentData = loadOnlineComponentData();
    return this.prepareComponentRefresh(componentData);
  }

  private refreshComponentsFromProject({ projectId }: RefreshComponentsFromProjectUiProjectCall): RefreshComponentsUiProjectCallResult {
    const componentData = Services.instance.projectManager.executeOnProject('core', projectId, loadCoreProjectComponentData);
    return this.prepareComponentRefresh(componentData);
  }

  private prepareComponentRefresh(componentData: NewComponentData) {
    const usage = this.model.collectComponentsUsage();
    const { breakingOperations, usageToClear } = prepareMergeComponentData(this.model.components, usage, componentData);
    const serverData: RefreshServerData = { componentData, usageToClear };
    return { breakingOperations, serverData };
  }

  private applyRefreshComponents({ serverData }: ApplyRefreshComponentsUiProjectCall) {
    this.executeUpdate(() => {
      const { componentData, usageToClear } = serverData as RefreshServerData;
      this.model.components.apply(componentData);
      const impacts = this.model.clearComponentsUsage(usageToClear);

      for (const window of impacts.windows) {
        this.notifyAllWindow(window);
      }

      for (const template of impacts.templates) {
        this.notifyAllTemplate(template);
      }

      this.notifyAllComponentData();
    });
  }

  private async deploy(): Promise<DeployUiProjectCallResult> {
    const validation = await this.validate();

    // only deploy if no validation errors
    if (validation.errors.length > 0) {
      return { validationErrors: validation.errors };
    }

    const uiInstances = Services.instance.online.getInstancesByCapability('ui-api');
    if (uiInstances.length === 0) {
      return { deployError: `Pas d'instance UI en ligne pour deployer` };
    }

    if (uiInstances.length > 1) {
      return { deployError: 'Il y a plusieurs instances UI en ligne. Non supporté' };
    }

    const [instanceName] = uiInstances;
    const definition = buildDeployDefinition(this.project);

    try {
      await Services.instance.online.uiSetDefinition(instanceName, definition);
    } catch(err) {
      log.error(err, `Error deploying project on instance '${instanceName}'`);
      return { deployError: err.message };
    }

    return {};
  }
}
