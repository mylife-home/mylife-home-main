import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { useTabPanelId } from '../../lib/tab-panel';
import { useFireAsync } from '../../lib/use-error-handling';
import { useSnackbar } from '../../dialogs/snackbar';
import { useShowBreakingOperationsDialog } from './breaking-operations-dialog';
import { AsyncDispatch } from '../../../store/types';
import { RefreshToolboxData } from '../../../store/core-designer/types';
import { 
  prepareRefreshToolboxFromFiles, prepareRefreshToolboxFromOnline, applyRefreshToolbox,
  deployToFiles, prepareDeployToOnline, applyDeployToOnline
} from '../../../store/core-designer/actions';

export function useRefreshToolboxFromFiles() {
  const tabId = useTabPanelId();
  const fireAsync = useFireAsync();
  const dispatch = useDispatch<AsyncDispatch<RefreshToolboxData>>();
  const executeRefresh = useExecuteRefresh();

  return useCallback(() => {
    fireAsync(async () => {
      const refreshData = await dispatch(prepareRefreshToolboxFromFiles({ id: tabId }));
      await executeRefresh(refreshData);
    });
  }, [fireAsync, dispatch]);
}

export function useRefreshToolboxFromOnline() {
  const tabId = useTabPanelId();
  const fireAsync = useFireAsync();
  const dispatch = useDispatch<AsyncDispatch<RefreshToolboxData>>();
  const executeRefresh = useExecuteRefresh();

  return useCallback(() => {
    fireAsync(async () => {
      const refreshData = await dispatch(prepareRefreshToolboxFromOnline({ id: tabId }));
      await executeRefresh(refreshData);
    });
  }, [fireAsync, dispatch]);
}

function useExecuteRefresh() {
  const tabId = useTabPanelId();
  const dispatch = useDispatch();
  const showBreakingOperations = useShowBreakingOperationsDialog();
  const { enqueueSnackbar } = useSnackbar();

  return useCallback(async (refreshData: RefreshToolboxData) => {
    if (refreshData.breakingOperations.length > 0) {
      const { status } = await showBreakingOperations(refreshData.breakingOperations);
      if(status !== 'ok') {
        return;
      }
    }

    await dispatch(applyRefreshToolbox({ id: tabId, serverData: refreshData.serverData }));

    enqueueSnackbar('La boîte à outils a été mis à jour.', { variant: 'success' });
  }, [dispatch, enqueueSnackbar]);
}

export function useDeployToFiles() {
  const tabId = useTabPanelId();
  const dispatch = useDispatch<AsyncDispatch<{ files: string[] }>>();
  const fireAsync = useFireAsync();
  const { enqueueSnackbar } = useSnackbar();

  return useCallback(() => {
    fireAsync(async () => {
      const { files } = await dispatch(deployToFiles({ id: tabId }));
      const text = files.length < 2 ? 'Fichier créé' : 'Fichiers créés';
      const list = files.map(file => `'${file}'`).join(', ');
      enqueueSnackbar(`${text} : ${list}`, { variant: 'success' });
    });
  }, [fireAsync, dispatch]);
}


export function useDeployToOnline() {
  const tabId = useTabPanelId();

  return useCallback(() => {
    console.log('TODO');
  }, []);
}
