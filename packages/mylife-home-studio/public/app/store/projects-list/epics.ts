import { SetListNotification, ClearListNotification, RenameListNotification, UpdateListNotification, UiProjectInfo, CoreProjectInfo } from '../../../../shared/project-manager';
import { createNotifierEpic } from '../common/notifier-epic';
import { setNotification, clearNotification, pushUpdates } from './actions';
import { getNotifierId, hasStartPageTab } from './selectors';
import { Update, SetProject, ClearProject, RenameProject, BaseProjectItem, CoreProjectItem, UiProjectItem } from './types';

export default createNotifierEpic({
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