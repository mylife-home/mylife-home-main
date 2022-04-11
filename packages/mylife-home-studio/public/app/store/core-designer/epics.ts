import { combineEpics } from 'redux-observable';

import { createOpendProjectManagementEpic } from '../common/designer-epics';
import { TabType } from '../tabs/types';
import { updateCoreDesignerTab } from '../tabs/actions';
import { setNotifier, clearAllNotifiers, removeOpenedProject, updateProject } from './actions';
import { hasOpenedProjects, getOpenedProject, getOpenedProjectsIdAndProjectIdList, getOpenedProjectIdByNotifierId } from './selectors';
import { ActionTypes, ActionPayloads, BulkUpdatesData, BulkUpdatesStats, OnlineDeployData, FilesDeployData, FilesDeployResult, ComponentDefinition } from './types';
import {
  UpdateToolboxCoreProjectCall,
  MoveComponentsCoreProjectCall,
  ConfigureComponentCoreProjectCall,
  RenameComponentCoreProjectCall,
  ClearComponentsCoreProjectCall,
  SetBindingCoreProjectCall,
  ClearBindingCoreProjectCall,
  CoreBindingData,
  SetComponentCoreProjectCall,
  PrepareDeployToOnlineCoreProjectCallResult,
  ApplyDeployToOnlineCoreProjectCall,
  CoreProjectCall,
  PrepareBulkUpdatesCoreProjectCallResult,
  ApplyBulkUpdatesCoreProject,
  PrepareImportFromOnlineCoreProjectCall,
  PrepareImportFromProjectCoreProjectCall,
  ApplyBulkUpdatesCoreProjectCallResult,
  ValidateCoreProjectCallResult,
  PrepareDeployToFilesCoreProjectCallResult,
  ApplyDeployToFilesCoreProjectCall,
  ApplyDeployToFilesCoreProjectCallResult,
  SetTemplateCoreProjectCall,
  RenameTemplateCoreProjectCall,
  ClearTemplateCoreProjectCall,
  SetTemplateExportCoreProjectCall,
  ClearTemplateExportCoreProjectCall,
} from '../../../../shared/project-manager';

const openedProjectManagementEpic = createOpendProjectManagementEpic({
  projectType: 'core',
  tabType: TabType.CORE_DESIGNER,
  setNotifier, clearAllNotifiers, removeOpenedProject, updateProject, updateTab: updateCoreDesignerTab,
  hasOpenedProjects, getOpenedProject, getOpenedProjectsIdAndProjectIdList, getOpenedProjectIdByNotifierId,
  callMappers: {

    [ActionTypes.PREPARE_IMPORT_FROM_ONLINE]: {
      mapper({ tabId, config }: ActionPayloads.PrepareImportFromOnline) {
        const callData: PrepareImportFromOnlineCoreProjectCall = { operation: 'prepare-import-from-online', config };
        return { tabId, callData };
      },
      resultMapper(serviceResult: PrepareBulkUpdatesCoreProjectCallResult): BulkUpdatesData {
        return { changes: serviceResult.changes, serverData: serviceResult.serverData };
      }
    },

    [ActionTypes.PREPARE_IMPORT_FROM_PROJECT]: {
      mapper({ tabId, config }: ActionPayloads.PrepareImportFromProject) {
        const callData: PrepareImportFromProjectCoreProjectCall = { operation: 'prepare-import-from-project', config };
        return { tabId, callData };
      },
      resultMapper(serviceResult: PrepareBulkUpdatesCoreProjectCallResult): BulkUpdatesData {
        return { changes: serviceResult.changes, serverData: serviceResult.serverData };
      }
    },

    [ActionTypes.APPLY_BULK_UPDATES]: {
      mapper({ tabId, serverData, selection }: ActionPayloads.ApplyBulkUpdates) {
        const callData: ApplyBulkUpdatesCoreProject = { operation: 'apply-bulk-updates', selection, serverData };
        return { tabId, callData };
      },
      resultMapper(serviceResult: ApplyBulkUpdatesCoreProjectCallResult): BulkUpdatesStats {
        return serviceResult.stats;
      }
    },

    [ActionTypes.VALIDATE_PROJECT]: {
      mapper({ tabId }: ActionPayloads.ValidateProject) {
        const callData: CoreProjectCall = { operation: 'validate' };
        return { tabId, callData };
      },
      resultMapper(serviceResult: ValidateCoreProjectCallResult) {
        return serviceResult.validation;
      }
    },

    [ActionTypes.PREPARE_DEPLOY_TO_FILES]: {
      mapper({ tabId }: ActionPayloads.PrepareDeployToFiles) {
        const callData: CoreProjectCall = { operation: 'prepare-deploy-to-files' };
        return { tabId, callData };
      },
      resultMapper(serviceResult: PrepareDeployToFilesCoreProjectCallResult): FilesDeployData {
        const { validation, changes, serverData, files, bindingsInstanceName } = serviceResult;
        return { validation, changes, serverData, files, bindingsInstanceName };
      }
    },

    [ActionTypes.APPLY_DEPLOY_TO_FILES]: {
      mapper({ tabId, bindingsInstanceName, serverData }: ActionPayloads.ApplyDeployToFiles) {
        const callData: ApplyDeployToFilesCoreProjectCall = { operation: 'apply-deploy-to-files', serverData, bindingsInstanceName };
        return { tabId, callData };
      },
      resultMapper(serviceResult: ApplyDeployToFilesCoreProjectCallResult): FilesDeployResult {
        const { writtenFilesCount } = serviceResult;
        return { writtenFilesCount };
      }
    },

    [ActionTypes.PREPARE_DEPLOY_TO_ONLINE]: {
      mapper({ tabId }: { tabId: string }) {
        const callData: CoreProjectCall = { operation: 'prepare-deploy-to-online' };
        return { tabId, callData };
      },
      resultMapper(serviceResult: PrepareDeployToOnlineCoreProjectCallResult): OnlineDeployData {
        const { validation, changes, serverData } = serviceResult;
        return { validation, changes, serverData };
      }
    },

    [ActionTypes.APPLY_DEPLOY_TO_ONLINE]: {
      mapper({ tabId, serverData }: ActionPayloads.ApplyDeployToOnline) {
        const callData: ApplyDeployToOnlineCoreProjectCall = { operation: 'apply-deploy-to-online', serverData };
        return { tabId, callData };
      }
    },

    [ActionTypes.UPDATE_TOOLBOX]: {
      mapper({ itemType, itemId, action }: ActionPayloads.UpdateToolbox) {
        const { tabId, id } = extractIds(itemId);
        const callData: UpdateToolboxCoreProjectCall = { operation: 'update-toolbox', itemType, itemId: id, action };
        return { tabId, callData };
      },
    },
    [ActionTypes.SET_TEMPLATE]: {
      mapper({ tabId, templateId }: ActionPayloads.SetTemplate) {
        const callData: SetTemplateCoreProjectCall = { operation: 'set-template', templateId };
        return { tabId, callData };
      },
    },
    [ActionTypes.RENAME_TEMPLATE]: {
      mapper({ templateId, newId }: ActionPayloads.RenameTemplate) {
        const { tabId, id } = extractIds(templateId);
        const callData: RenameTemplateCoreProjectCall = { operation: 'rename-template', templateId: id, newId };
        return { tabId, callData };
      },
    },
    [ActionTypes.CLEAR_TEMPLATE]: {
      mapper({ templateId }: ActionPayloads.ClearTemplate) {
        const { tabId, id } = extractIds(templateId);
        const callData: ClearTemplateCoreProjectCall = { operation: 'clear-template', templateId: id };
        return { tabId, callData };
      },
    },
    [ActionTypes.SET_TEMPLATE_EXPORT]: {
      mapper({ exportType, exportId, componentId: fullComponentId, propertyName }: ActionPayloads.SetTemplateExport) {
        const { tabId, templateId, id: componentId } = extractIdsWithTemplate(fullComponentId);
        const callData: SetTemplateExportCoreProjectCall = { operation: 'set-template-export', templateId, exportType, exportId, componentId, propertyName };
        return { tabId, callData };
      },
    },
    [ActionTypes.CLEAR_TEMPLATE_EXPORT]: {
      mapper({ templateId, exportType, exportId }: ActionPayloads.ClearTemplateExport) {
        const { tabId, id } = extractIds(templateId);
        const callData: ClearTemplateExportCoreProjectCall = { operation: 'clear-template-export', templateId: id, exportType, exportId };
        return { tabId, callData };
      },
      resultMapper(serviceResult: PrepareBulkUpdatesCoreProjectCallResult): BulkUpdatesData {
        return { changes: serviceResult.changes, serverData: serviceResult.serverData };
      },
    },
    [ActionTypes.SET_COMPONENT]: {
      mapper({ templateId: fullTemplateId, componentId, definition: fullDefinition, position }: ActionPayloads.SetComponent) {
        const { tabId, id } = extractIds(fullDefinition.id);
        const templateId = fullTemplateId && extractIds(fullTemplateId).id;
        const definition: ComponentDefinition = { type: fullDefinition.type, id };
        const callData: SetComponentCoreProjectCall = { operation: 'set-component', templateId, componentId, definition, x: position.x, y: position.y };
        return { tabId, callData };
      },
    },
    [ActionTypes.MOVE_COMPONENTS]: {
      mapper({ componentsIds, delta }: ActionPayloads.MoveComponents) {
        const { tabId, templateId, ids } = extractIdsListWithTemplate(componentsIds);
        const callData: MoveComponentsCoreProjectCall = { operation: 'move-components', templateId, componentsIds: ids, delta };
        return { tabId, callData };
      },
    },
    [ActionTypes.CONFIGURE_COMPONENT]: {
      mapper({ componentId, configId, configValue }: ActionPayloads.ConfigureComponent) {
        const { tabId, templateId, id } = extractIdsWithTemplate(componentId);
        const callData: ConfigureComponentCoreProjectCall = { operation: 'configure-component', templateId, componentId: id, configId, configValue };
        return { tabId, callData };
      },
    },
    [ActionTypes.RENAME_COMPONENT]: {
      mapper({ componentId, newId }: ActionPayloads.RenameComponent) {
        const { tabId, templateId, id } = extractIdsWithTemplate(componentId);
        const callData: RenameComponentCoreProjectCall = { operation: 'rename-component', templateId, componentId: id, newId };
        return { tabId, callData };
      },
    },
    [ActionTypes.CLEAR_COMPONENTS]: {
      mapper({ componentsIds }: ActionPayloads.ClearComponents) {
        const { tabId, templateId, ids } = extractIdsListWithTemplate(componentsIds);
        const callData: ClearComponentsCoreProjectCall = { operation: 'clear-components', templateId, componentsIds: ids };
        return { tabId, callData };
      },
    },
    [ActionTypes.SET_BINDING]: {
      mapper({ binding }: ActionPayloads.SetBinding) {
        const { tabId, templateId, ids } = extractIdsListWithTemplate([binding.sourceComponent, binding.targetComponent]);
        const [sourceComponent, targetComponent] = ids;

        const bindingData: CoreBindingData = {
          ...binding,
          sourceComponent,
          targetComponent,
        };
        
        const callData: SetBindingCoreProjectCall = { operation: 'set-binding', templateId, binding: bindingData };
        return { tabId, callData };
      },
    },
    [ActionTypes.CLEAR_BINDING]: {
      mapper({ bindingId }: ActionPayloads.ClearBinding) {
        const { tabId, templateId, id } = extractIdsWithTemplate(bindingId);
        const callData: ClearBindingCoreProjectCall = { operation: 'clear-binding', templateId, bindingId: id };
        return { tabId, callData };
      },
    },
  }
});

export default combineEpics(openedProjectManagementEpic);

function extractIds(fullId: string): { tabId: string, id: string; } {
  const sepPos = fullId.indexOf(':');
  if (sepPos < 0) {
    throw new Error(`Bad id: '${fullId}'`);
  }

  return {
    tabId: fullId.substring(0, sepPos),
    id: fullId.substring(sepPos + 1),
  };
}

function extractIdsWithTemplate(fullId: string): { tabId: string, templateId: string; id: string; } {
  // first extract tab
  const { tabId, id: remaining } = extractIds(fullId);
  // then extract templateId
  const { tabId: templateId, id } = extractIds(remaining);

  return { tabId, templateId: templateId || null, id };
}

function extractIdsList(fullIds: string[]): { tabId: string, ids: string[]; } {
  const ids: string[] = [];
  let finalTabId = null;

  for (const fullId of fullIds) {
    const { tabId, id } = extractIds(fullId);

    if (!finalTabId) {
      finalTabId = tabId;
    } else if (tabId !== finalTabId) {
      throw new Error(`Project id mismatch! ('${tabId}' !== '${finalTabId}')`);
    }

    ids.push(id);
  }

  return { tabId: finalTabId, ids };
}

function extractIdsListWithTemplate(fullIds: string[]): { tabId: string, templateId: string, ids: string[]; } {
  const ids: string[] = [];
  let finalTabId = null;
  let finalTemplateId = null;

  for (const fullId of fullIds) {
    const { tabId, templateId, id } = extractIdsWithTemplate(fullId);

    if (!finalTabId) {
      finalTabId = tabId;
      finalTemplateId = templateId;
    } else if (tabId !== finalTabId) {
      throw new Error(`Project id mismatch! ('${tabId}' !== '${finalTabId}')`);
    } else if (templateId !== finalTemplateId) {
      throw new Error(`Template id mismatch! ('${templateId}' !== '${finalTemplateId}')`);
    }

    ids.push(id);
  }

  return { tabId: finalTabId, templateId: finalTemplateId, ids };
}