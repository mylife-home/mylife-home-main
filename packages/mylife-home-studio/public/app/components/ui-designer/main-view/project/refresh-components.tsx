import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { AsyncDispatch } from '../../../../store/types';
import { refreshComponentsFromOnline, refreshComponentsFromProject, applyRefreshComponents } from '../../../../store/ui-designer/actions';
import { RefreshData } from '../../../../store/ui-designer/types';
import { useTabPanelId } from '../../../lib/tab-panel';
import { useFireAsync } from '../../../lib/use-error-handling';
import { useSnackbar } from '../../../dialogs/snackbar';
import { useProjectSelectionDialog } from './project-selection-dialog';

export function useRefreshComponentsFromOnline() {
  const tabId = useTabPanelId();
  const dispatch = useDispatch<AsyncDispatch<RefreshData>>();
  const fireAsync = useFireAsync();
  const executeRefresh = useExecuteRefresh();

  return useCallback(() => {
    fireAsync(async () => {
      const refreshData = await dispatch(refreshComponentsFromOnline({ id: tabId }));
      await executeRefresh(refreshData);
    });
  }, [fireAsync, dispatch, executeRefresh]);
}

export function useRefreshComponentsFromCoreProject() {
  const tabId = useTabPanelId();
  const dispatch = useDispatch<AsyncDispatch<RefreshData>>();
  const fireAsync = useFireAsync();
  const showProjectSelectionDialog = useProjectSelectionDialog();
  const executeRefresh = useExecuteRefresh();

  return useCallback(() => {
    fireAsync(async () => {
      const projectId = await showProjectSelectionDialog();
      if (!projectId) {
        return;
      }

      const refreshData = await dispatch(refreshComponentsFromProject({ id: tabId, projectId }));
      await executeRefresh(refreshData);
    });
  }, [fireAsync, dispatch, showProjectSelectionDialog, executeRefresh]);
}

function useExecuteRefresh() {
  const tabId = useTabPanelId();
  const dispatch = useDispatch<AsyncDispatch<RefreshData>>();
  const { enqueueSnackbar } = useSnackbar();

  return useCallback(async (refreshData: RefreshData) => {
    if (refreshData.breakingOperations.length > 0) {
      // TODO
    }

    await dispatch(applyRefreshComponents({ id: tabId, serverData: refreshData.serverData }));

    enqueueSnackbar('Les composants ont été mis à jour.', { variant: 'success' });
  }, [dispatch, enqueueSnackbar]);
}