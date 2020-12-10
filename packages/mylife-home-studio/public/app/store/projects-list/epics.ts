import { map } from 'rxjs/operators';
import { combineEpics } from 'redux-observable';

import { SetListNotification, ClearListNotification, RenameListNotification, UpdateListNotification, UiProjectInfo, CoreProjectInfo, ProjectType } from '../../../../shared/project-manager';
import { createNotifierEpic } from '../common/notifier-epic';
import { createSocketCallEpic } from '../common/call-epic';
import { newUiDesignerTab, newCoreDesignerTab } from '../tabs/actions';
import { setNotification, clearNotification, pushUpdates } from './actions';
import { getNotifierId, hasStartPageTab } from './selectors';
import { Update, SetProject, ClearProject, RenameProject, BaseProjectItem, CoreProjectItem, UiProjectItem, ActionTypes } from './types';

const notifierEpic = createNotifierEpic({
  notificationType: 'project-manager/list',
  startNotifierService: 'project-manager/start-notify-list',
  stopNotifierService: 'project-manager/stop-notify-list',
  getNotifierId,
  hasTypedTab: hasStartPageTab,
  setNotification,
  clearNotification,
  applyUpdates: pushUpdates,
  parseUpdate: parseUpdate,
});

const importV1ProjectEpic = createSocketCallEpic(ActionTypes.IMPORT_V1, 'project-manager/import-v1', undefined, map(openCreatedProject));
const createNewProjectEpic = createSocketCallEpic(ActionTypes.CREATE_NEW, 'project-manager/create-new', undefined, map(openCreatedProject));
const duplicateProjectEpic = createSocketCallEpic(ActionTypes.DUPLICATE, 'project-manager/duplicate', undefined, map(openCreatedProject));
const renameProjectEpic = createSocketCallEpic(ActionTypes.RENAME, 'project-manager/rename');
const deleteProjectEpic = createSocketCallEpic(ActionTypes.DELETE, 'project-manager/delete');

export default combineEpics(notifierEpic, importV1ProjectEpic, createNewProjectEpic, duplicateProjectEpic, renameProjectEpic, deleteProjectEpic);

function openCreatedProject({ type, createdId: projectId }: { type: ProjectType; createdId: string; }) {
  switch (type) {
    case 'core':
      return newCoreDesignerTab({ projectId });
    case 'ui':
      return newUiDesignerTab({ projectId });
  }
}

function parseUpdate(input: UpdateListNotification): Update {
  switch (input.operation) {
    case 'set': {
      const typedInput = input as SetListNotification;
      const output: SetProject = { operation: 'set', type: typedInput.type, item: parseProjectInfo(typedInput) };
      return output;
    }

    case 'clear': {
      const typedInput = input as ClearListNotification;
      const output: ClearProject = { operation: 'clear', type: typedInput.type, id: typedInput.name };
      return output;
    }

    case 'rename': {
      const typedInput = input as RenameListNotification;
      const output: RenameProject = { operation: 'rename', type: typedInput.type, oldId: typedInput.name, newId: typedInput.newName };
      return output;
    }
  }
}

function parseProjectInfo(input: SetListNotification): BaseProjectItem {
  switch (input.type) {
    case 'core': {
      const info = input.info as CoreProjectInfo;
      const item: CoreProjectItem = { id: input.name, ...info };
      return item;
    }

    case 'ui': {
      const info = input.info as UiProjectInfo;
      const item: UiProjectItem = { id: input.name, ...info };
      return item;
    }
  }

}