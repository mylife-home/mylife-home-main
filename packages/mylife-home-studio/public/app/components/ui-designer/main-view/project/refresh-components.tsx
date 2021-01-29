import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { useTabPanelId } from '../../../lib/tab-panel';
import { useFireAsync } from '../../../lib/use-error-handling';
import { useProjectSelectionDialog } from './project-selection-dialog';
import { refreshComponentsFromOnline, refreshComponentsFromProject } from '../../../../store/ui-designer/actions';

export function useRefreshComponentsFromOnline() {
  const tabId = useTabPanelId();
  const dispatch = useDispatch();
  const fireAsync = useFireAsync();

  return useCallback(() => {
    fireAsync(async () => {
      const result = await dispatch(refreshComponentsFromOnline({ id: tabId }));
      console.log('refreshComponentsFromOnline', result);
    });
  }, [fireAsync, dispatch]);
}

export function useRefreshComponentsFromCoreProject() {
  const tabId = useTabPanelId();
  const dispatch = useDispatch();
  const fireAsync = useFireAsync();
  const showProjectSelectionDialog = useProjectSelectionDialog();

  return useCallback(() => {
    fireAsync(async () => {
      const projectId = await showProjectSelectionDialog();
      if (!projectId) {
        return;
      }

      const result = await dispatch(refreshComponentsFromProject({ id: tabId, projectId }));
      console.log('refreshComponentsFromProject', result);
    });
  }, [fireAsync, dispatch, showProjectSelectionDialog]);
}
