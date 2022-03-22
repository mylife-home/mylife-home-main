import { combineEpics } from 'redux-observable';

import { createOpendProjectManagementEpic } from '../common/designer-epics';
import { TabType } from '../tabs/types';
import { updateCoreDesignerTab } from '../tabs/actions';
import { setNotifier, clearAllNotifiers, removeOpenedProject, updateProject } from './actions';
import { hasOpenedProjects, getOpenedProject, getOpenedProjectsIdAndProjectIdList, getOpenedProjectIdByNotifierId } from './selectors';
import { ActionTypes, BulkUpdatesData, Position, BulkUpdatesStats, ImportFromOnlineConfig, ImportFromProjectConfig, OnlineDeployData, FilesDeployData, FilesDeployResult } from './types';
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
      mapper({ tabId, config }: { tabId: string; config: ImportFromOnlineConfig}) {
        return {
          tabId,
          callData: { operation: 'prepare-import-from-online', config } as PrepareImportFromOnlineCoreProjectCall
        };
      },
      resultMapper(serviceResult: PrepareBulkUpdatesCoreProjectCallResult): BulkUpdatesData {
        return { changes: serviceResult.changes, serverData: serviceResult.serverData };
      }
    },

    [ActionTypes.PREPARE_IMPORT_FROM_PROJECT]: {
      mapper({ tabId, config }: { tabId: string; config: ImportFromProjectConfig}) {
        return {
          tabId,
          callData: { operation: 'prepare-import-from-project', config } as PrepareImportFromProjectCoreProjectCall
        };
      },
      resultMapper(serviceResult: PrepareBulkUpdatesCoreProjectCallResult): BulkUpdatesData {
        return { changes: serviceResult.changes, serverData: serviceResult.serverData };
      }
    },

    [ActionTypes.APPLY_BULK_UPDATES]: {
      mapper({ tabId, serverData, selection }: { tabId: string; serverData: unknown, selection: string[] }) {
        return {
          tabId,
          callData: { operation: 'apply-bulk-updates', selection, serverData } as ApplyBulkUpdatesCoreProject
        };
      },
      resultMapper(serviceResult: ApplyBulkUpdatesCoreProjectCallResult): BulkUpdatesStats {
        return serviceResult.stats;
      }
    },

    [ActionTypes.VALIDATE_PROJECT]: {
      mapper({ tabId }: { tabId: string }) {
        return {
          tabId,
          callData: { operation: 'validate' } as CoreProjectCall
        };
      },
      resultMapper(serviceResult: ValidateCoreProjectCallResult) {
        return serviceResult.validation;
      }
    },

    [ActionTypes.PREPARE_DEPLOY_TO_FILES]: {
      mapper({ tabId }: { tabId: string }) {
        return {
          tabId,
          callData: { operation: 'prepare-deploy-to-files' } as CoreProjectCall
        };
      },
      resultMapper(serviceResult: PrepareDeployToFilesCoreProjectCallResult): FilesDeployData {
        const { validation, changes, serverData, files, bindingsInstanceName } = serviceResult;
        return { validation, changes, serverData, files, bindingsInstanceName };
      }
    },

    [ActionTypes.APPLY_DEPLOY_TO_FILES]: {
      mapper({ tabId, bindingsInstanceName, serverData }: { tabId: string; bindingsInstanceName?: string; serverData: unknown }) {
        return {
          tabId,
          callData: { operation: 'apply-deploy-to-files', serverData, bindingsInstanceName } as ApplyDeployToFilesCoreProjectCall
        };
      },
      resultMapper(serviceResult: ApplyDeployToFilesCoreProjectCallResult): FilesDeployResult {
        const { writtenFilesCount } = serviceResult;
        return { writtenFilesCount };
      }
    },

    [ActionTypes.PREPARE_DEPLOY_TO_ONLINE]: {
      mapper({ tabId }: { tabId: string }) {
        return {
          tabId,
          callData: { operation: 'prepare-deploy-to-online' } as CoreProjectCall
        };
      },
      resultMapper(serviceResult: PrepareDeployToOnlineCoreProjectCallResult): OnlineDeployData {
        const { validation, changes, serverData } = serviceResult;
        return { validation, changes, serverData };
      }
    },

    [ActionTypes.APPLY_DEPLOY_TO_ONLINE]: {
      mapper({ tabId, serverData }: { tabId: string; serverData: unknown }) {
        return {
          tabId,
          callData: { operation: 'apply-deploy-to-online', serverData } as ApplyDeployToOnlineCoreProjectCall
        };
      }
    },

    [ActionTypes.UPDATE_TOOLBOX]: {
      mapper({ itemType, itemId, action }: { itemType: 'instance' | 'plugin'; itemId: string; action: 'show' | 'hide' | 'delete' }) {
        const { tabId, id } = extractIds(itemId);
        return {
          tabId,
          callData: { operation: 'update-toolbox', itemType, itemId: id, action } as UpdateToolboxCoreProjectCall
        };
      },
    },
    [ActionTypes.SET_TEMPLATE]: {
      mapper({ tabId, templateId }: { tabId: string; templateId: string }) {
        return {
          tabId,
          callData: { operation: 'set-template', templateId } as SetTemplateCoreProjectCall
        };
      },
    },
    [ActionTypes.RENAME_TEMPLATE]: {
      mapper({ templateId, newId }: { templateId: string; newId: string }) {
        const { tabId, id } = extractIds(templateId);
        return {
          tabId,
          callData: { operation: 'rename-template', templateId: id, newId } as RenameTemplateCoreProjectCall
        };
      },
    },
    [ActionTypes.CLEAR_TEMPLATE]: {
      mapper({ templateId }: { templateId: string }) {
        const { tabId, id } = extractIds(templateId);
        return {
          tabId,
          callData: { operation: 'clear-template', templateId: id } as ClearTemplateCoreProjectCall
        };
      },
    },
    [ActionTypes.SET_TEMPLATE_EXPORT]: {
      mapper({ templateId, exportType, exportId, componentId, propertyName }: { templateId: string; exportType: 'config' | 'member'; exportId: string; componentId: string; propertyName: string; }) {
        const { tabId, id } = extractIds(templateId);
        return {
          tabId,
          callData: { operation: 'set-template-export', templateId: id, exportType, exportId, componentId, propertyName } as SetTemplateExportCoreProjectCall
        };
      },
    },
    [ActionTypes.CLEAR_TEMPLATE_EXPORT]: {
      mapper({ templateId, exportType, exportId }: { templateId: string; exportType: 'config' | 'member'; exportId: string; }) {
        const { tabId, id } = extractIds(templateId);
        return {
          tabId,
          callData: { operation: 'clear-template-export', templateId: id, exportType, exportId } as ClearTemplateExportCoreProjectCall
        };
      },
    },
    [ActionTypes.SET_COMPONENT]: {
      mapper({ tabId, componentId, pluginId: fullPluginId, position }: { tabId: string; componentId: string; pluginId: string; position: Position }) {
        const { id: pluginId } = extractIds(fullPluginId);
        return {
          tabId,
          callData: { operation: 'set-component', componentId, pluginId, x: position.x, y: position.y } as SetComponentCoreProjectCall
        };
      },
    },
    [ActionTypes.MOVE_COMPONENTS]: {
      mapper({ componentsIds, delta }: { componentsIds: string[]; delta: Position }) {
        const { tabId, ids } = extractIdsList(componentsIds);
        return {
          tabId,
          callData: { operation: 'move-components', componentsIds: ids, delta } as MoveComponentsCoreProjectCall
        };
      },
    },
    [ActionTypes.CONFIGURE_COMPONENT]: {
      mapper({ componentId, configId, configValue }: { componentId: string; configId: string; configValue: any }) {
        const { tabId, id } = extractIds(componentId);
        return {
          tabId,
          callData: { operation: 'configure-component', componentId: id, configId, configValue } as ConfigureComponentCoreProjectCall
        };
      },
    },
    [ActionTypes.RENAME_COMPONENT]: {
      mapper({ componentId, newId }: { componentId: string; newId: string }) {
        const { tabId, id } = extractIds(componentId);
        return {
          tabId,
          callData: { operation: 'rename-component', componentId: id, newId } as RenameComponentCoreProjectCall
        };
      },
    },
    [ActionTypes.CLEAR_COMPONENTS]: {
      mapper({ componentsIds }: { componentsIds: string[] }) {
        const { tabId, ids } = extractIdsList(componentsIds);
        return {
          tabId,
          callData: { operation: 'clear-components', componentsIds: ids } as ClearComponentsCoreProjectCall
        };
      },
    },
    [ActionTypes.SET_BINDING]: {
      mapper({ tabId, binding }: { tabId: string; binding: CoreBindingData }) {
        const { id: sourceComponent } = extractIds(binding.sourceComponent);
        const { id: targetComponent } = extractIds(binding.targetComponent);

        const bindingData: CoreBindingData = {
          ...binding,
          sourceComponent,
          targetComponent,
        };
        
        return {
          tabId,
          callData: { operation: 'set-binding', binding: bindingData } as SetBindingCoreProjectCall
        };
      },
    },
    [ActionTypes.CLEAR_BINDING]: {
      mapper({ bindingId }: { bindingId: string }) {
        const { tabId, id } = extractIds(bindingId);
        return {
          tabId,
          callData: { operation: 'clear-binding', bindingId: id } as ClearBindingCoreProjectCall
        };
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