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
} from '../../../../shared/project-manager';

const openedProjectManagementEpic = createOpendProjectManagementEpic({
  projectType: 'core',
  tabType: TabType.CORE_DESIGNER,
  setNotifier, clearAllNotifiers, removeOpenedProject, updateProject, updateTab: updateCoreDesignerTab,
  hasOpenedProjects, getOpenedProject, getOpenedProjectsIdAndProjectIdList, getOpenedProjectIdByNotifierId,
  callMappers: {

    [ActionTypes.PREPARE_IMPORT_FROM_ONLINE]: {
      mapper({ id, config }: { id: string; config: ImportFromOnlineConfig}) {
        return {
          tabId: id,
          callData: { operation: 'prepare-import-from-online', config } as PrepareImportFromOnlineCoreProjectCall
        };
      },
      resultMapper(serviceResult: PrepareBulkUpdatesCoreProjectCallResult): BulkUpdatesData {
        return { changes: serviceResult.changes, serverData: serviceResult.serverData };
      }
    },

    [ActionTypes.PREPARE_IMPORT_FROM_PROJECT]: {
      mapper({ id, config }: { id: string; config: ImportFromProjectConfig}) {
        return {
          tabId: id,
          callData: { operation: 'prepare-import-from-project', config } as PrepareImportFromProjectCoreProjectCall
        };
      },
      resultMapper(serviceResult: PrepareBulkUpdatesCoreProjectCallResult): BulkUpdatesData {
        return { changes: serviceResult.changes, serverData: serviceResult.serverData };
      }
    },

    [ActionTypes.APPLY_BULK_UPDATES]: {
      mapper({ id, serverData, selection }: { id: string; serverData: unknown, selection: string[] }) {
        return {
          tabId: id,
          callData: { operation: 'apply-bulk-updates', selection, serverData } as ApplyBulkUpdatesCoreProject
        };
      },
      resultMapper(serviceResult: ApplyBulkUpdatesCoreProjectCallResult): BulkUpdatesStats {
        return serviceResult.stats;
      }
    },

    [ActionTypes.VALIDATE_PROJECT]: {
      mapper({ id }: { id: string }) {
        return {
          tabId: id,
          callData: { operation: 'validate' } as CoreProjectCall
        };
      },
      resultMapper(serviceResult: ValidateCoreProjectCallResult) {
        return serviceResult.validation;
      }
    },

    [ActionTypes.PREPARE_DEPLOY_TO_FILES]: {
      mapper({ id }: { id: string }) {
        return {
          tabId: id,
          callData: { operation: 'prepare-deploy-to-files' } as CoreProjectCall
        };
      },
      resultMapper(serviceResult: PrepareDeployToFilesCoreProjectCallResult): FilesDeployData {
        const { validation, changes, serverData, files, bindingsInstanceName } = serviceResult;
        return { validation, changes, serverData, files, bindingsInstanceName };
      }
    },

    [ActionTypes.APPLY_DEPLOY_TO_FILES]: {
      mapper({ id, bindingsInstanceName, serverData }: { id: string; bindingsInstanceName?: string; serverData: unknown }) {
        return {
          tabId: id,
          callData: { operation: 'apply-deploy-to-files', serverData, bindingsInstanceName } as ApplyDeployToFilesCoreProjectCall
        };
      },
      resultMapper(serviceResult: ApplyDeployToFilesCoreProjectCallResult): FilesDeployResult {
        const { writtenFilesCount } = serviceResult;
        return { writtenFilesCount };
      }
    },

    [ActionTypes.PREPARE_DEPLOY_TO_ONLINE]: {
      mapper({ id }: { id: string }) {
        return {
          tabId: id,
          callData: { operation: 'prepare-deploy-to-online' } as CoreProjectCall
        };
      },
      resultMapper(serviceResult: PrepareDeployToOnlineCoreProjectCallResult): OnlineDeployData {
        const { validation, changes, serverData } = serviceResult;
        return { validation, changes, serverData };
      }
    },

    [ActionTypes.APPLY_DEPLOY_TO_ONLINE]: {
      mapper({ id, serverData }: { id: string; serverData: unknown }) {
        return {
          tabId: id,
          callData: { operation: 'apply-deploy-to-online', serverData } as ApplyDeployToOnlineCoreProjectCall
        };
      }
    },

    [ActionTypes.UPDATE_TOOLBOX]: {
      mapper({ id, itemType, itemId, action }: { id: string; itemType: 'instance' | 'plugin'; itemId: string; action: 'show' | 'hide' | 'delete' }) {
        return {
          tabId: id,
          callData: { operation: 'update-toolbox', itemType, itemId, action } as UpdateToolboxCoreProjectCall
        };
      },
    },
    [ActionTypes.SET_COMPONENT]: {
      mapper({ id, componentId, pluginId, position }: { id: string; componentId: string; pluginId: string; position: Position }) {
        return {
          tabId: id,
          callData: { operation: 'set-component', componentId, pluginId, x: position.x, y: position.y } as SetComponentCoreProjectCall
        };
      },
    },
    [ActionTypes.MOVE_COMPONENTS]: {
      mapper({ id, componentsIds, delta }: { id: string; componentsIds: string[]; delta: Position }) {
        return {
          tabId: id,
          callData: { operation: 'move-components', componentsIds, delta } as MoveComponentsCoreProjectCall
        };
      },
    },
    [ActionTypes.CONFIGURE_COMPONENT]: {
      mapper({ id, componentId, configId, configValue }: { id: string; componentId: string; configId: string; configValue: any }) {
        return {
          tabId: id,
          callData: { operation: 'configure-component', componentId, configId, configValue } as ConfigureComponentCoreProjectCall
        };
      },
    },
    [ActionTypes.RENAME_COMPONENT]: {
      mapper({ id, componentId, newId }: { id: string; componentId: string; newId: string }) {
        return {
          tabId: id,
          callData: { operation: 'rename-component', componentId, newId } as RenameComponentCoreProjectCall
        };
      },
    },
    [ActionTypes.CLEAR_COMPONENTS]: {
      mapper({ id, componentsIds }: { id: string; componentsIds: string[] }) {
        return {
          tabId: id,
          callData: { operation: 'clear-components', componentsIds } as ClearComponentsCoreProjectCall
        };
      },
    },
    [ActionTypes.SET_BINDING]: {
      mapper({ id, binding }: { id: string; binding: CoreBindingData }) {
        return {
          tabId: id,
          callData: { operation: 'set-binding', binding } as SetBindingCoreProjectCall
        };
      },
    },
    [ActionTypes.CLEAR_BINDING]: {
      mapper({ id, bindingId }: { id: string; bindingId: string }) {
        return {
          tabId: id,
          callData: { operation: 'clear-binding', bindingId } as ClearBindingCoreProjectCall
        };
      },
    },
  }
});

export default combineEpics(openedProjectManagementEpic);
