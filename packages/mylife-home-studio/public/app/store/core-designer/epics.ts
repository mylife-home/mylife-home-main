import { combineEpics } from 'redux-observable';

import { createOpendProjectManagementEpic } from '../common/designer-epics';
import { TabType } from '../tabs/types';
import { updateCoreDesignerTab } from '../tabs/actions';
import { setNotifier, clearAllNotifiers, removeOpenedProject, updateProject } from './actions';
import { hasOpenedProjects, getOpenedProject, getOpenedProjectsIdAndProjectIdList, getOpenedProjectIdByNotifierId } from './selectors';
import { ActionTypes, BulkUpdatesData, Position } from './types';
import {
  UpdateToolboxCoreProjectCall,
  MoveComponentCoreProjectCall,
  ConfigureComponentCoreProjectCall,
  RenameComponentCoreProjectCall,
  ClearComponentCoreProjectCall,
  SetBindingCoreProjectCall,
  ClearBindingCoreProjectCall,
  CoreBindingData,
  SetComponentCoreProjectCall,
  DeployToFilesCoreProjectCallResult,
  PrepareDeployToOnlineCoreProjectCallResult,
  ApplyDeployToOnlineCoreProjectCall,
  CoreProjectCall,
  PrepareBulkUpdateCoreProjectCallResult,
  ApplyBulkUpdatesCoreProject,
  PrepareImportFromProjectCoreProjectCall,
  ImportFromProjectConfig
} from '../../../../shared/project-manager';

const openedProjectManagementEpic = createOpendProjectManagementEpic({
  projectType: 'core',
  tabType: TabType.CORE_DESIGNER,
  setNotifier, clearAllNotifiers, removeOpenedProject, updateProject, updateTab: updateCoreDesignerTab,
  hasOpenedProjects, getOpenedProject, getOpenedProjectsIdAndProjectIdList, getOpenedProjectIdByNotifierId,
  callMappers: {

    [ActionTypes.PREPARE_REFRESH_TOOLBOX_FROM_ONLINE]: {
      mapper() {
        return { operation: 'prepare-refresh-toolbox-from-online' } as CoreProjectCall;
      },
      resultMapper(serviceResult: PrepareBulkUpdateCoreProjectCallResult): BulkUpdatesData {
        return { changes: serviceResult.changes, serverData: serviceResult.serverData };
      }
    },

    [ActionTypes.PREPARE_IMPORT_FROM_PROJECT]: {
      mapper({ config }: { config: ImportFromProjectConfig}) {
        return { operation: 'prepare-import-from-project', config } as PrepareImportFromProjectCoreProjectCall;
      },
      resultMapper(serviceResult: PrepareBulkUpdateCoreProjectCallResult): BulkUpdatesData {
        return { changes: serviceResult.changes, serverData: serviceResult.serverData };
      }
    },

    [ActionTypes.APPLY_BULK_UPDATES]: {
      mapper({ serverData }: { serverData: unknown }) {
        return { operation: 'apply-bulk-updates', serverData } as ApplyBulkUpdatesCoreProject;
      }
    },

    [ActionTypes.DEPLOY_TO_FILES]: {
      mapper() {
        return { operation: 'deploy-to-files' } as CoreProjectCall;
      },
      resultMapper(serviceResult: DeployToFilesCoreProjectCallResult) {
        return { files: serviceResult.files };
      }
    },

    [ActionTypes.PREPARE_DEPLOY_TO_ONLINE]: {
      mapper() {
        return { operation: 'prepare-deploy-to-online' } as CoreProjectCall;
      },
      resultMapper(serviceResult: PrepareDeployToOnlineCoreProjectCallResult) {
        return { changes: serviceResult.changes, serverData: serviceResult.serverData };
      }
    },

    [ActionTypes.APPLY_DEPLOY_TO_ONLINE]: {
      mapper({ serverData }: { serverData: unknown }) {
        return { operation: 'apply-deploy-to-online', serverData } as ApplyDeployToOnlineCoreProjectCall;
      }
    },

    [ActionTypes.UPDATE_TOOLBOX]: {
      mapper({ itemType, itemId, action }: { itemType: 'instance' | 'plugin'; itemId: string; action: 'show' | 'hide' | 'delete' }) {
        return { operation: 'update-toolbox', itemType, itemId, action } as UpdateToolboxCoreProjectCall;
      },
    },
    [ActionTypes.SET_COMPONENT]: {
      mapper({ componentId, pluginId, position }: { componentId: string; pluginId: string; position: Position }) {
        return { operation: 'set-component', componentId, pluginId, x: position.x, y: position.y } as SetComponentCoreProjectCall;
      },
    },
    [ActionTypes.MOVE_COMPONENT]: {
      mapper({ componentId, position }: { componentId: string; position: Position }) {
        return { operation: 'move-component', componentId, x: position.x, y: position.y } as MoveComponentCoreProjectCall;
      },
    },
    [ActionTypes.CONFIGURE_COMPONENT]: {
      mapper({ componentId, configId, configValue }: { componentId: string; configId: string; configValue: any }) {
        return { operation: 'configure-component', componentId, configId, configValue } as ConfigureComponentCoreProjectCall;
      },
    },
    [ActionTypes.RENAME_COMPONENT]: {
      mapper({ componentId, newId }: { componentId: string; newId: string }) {
        return { operation: 'rename-component', componentId, newId } as RenameComponentCoreProjectCall;
      },
    },
    [ActionTypes.CLEAR_COMPONENT]: {
      mapper({ componentId }: { componentId: string }) {
        return { operation: 'clear-component', componentId } as ClearComponentCoreProjectCall;
      },
    },
    [ActionTypes.SET_BINDING]: {
      mapper({ binding }: { binding: CoreBindingData }) {
        return { operation: 'set-binding', binding } as SetBindingCoreProjectCall;
      },
    },
    [ActionTypes.CLEAR_BINDING]: {
      mapper({ bindingId }: { bindingId: string }) {
        return { operation: 'clear-binding', bindingId } as ClearBindingCoreProjectCall;
      },
    },
    // TODO
  }
});

export default combineEpics(openedProjectManagementEpic);
