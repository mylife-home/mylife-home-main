import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { useTabPanelId } from '../../lib/tab-panel';
import { useFireAsync } from '../../lib/use-error-handling';
import { useSnackbar } from '../../dialogs/snackbar';
import { useShowBreakingOperationsDialog } from './breaking-operations-dialog';
import { AsyncDispatch } from '../../../store/types';
import { BulkUpdatesData } from '../../../store/core-designer/types';
import { 
  prepareImportFromProject, prepareRefreshToolboxFromOnline, applyBulkUpdates,
  deployToFiles, prepareDeployToOnline, applyDeployToOnline
} from '../../../store/core-designer/actions';
import { useImportFromProjectSelectionDialog } from './import-from-project-selection-dialog';

// importer depuis un autre projet:
// - les plugins
// - les composants, en externe (sans config)
// - les composants, en interne (copie, pour fusion de projets)

/*

Pas d'import de binding
Déploiement -> une instance est toujours déployée entièrement avec un seul projet, les composants externes sont ignorés
Import plugins = tous les plugins
Import composants = composants + seulement plugins associés, sans x,y
Gérer conflits plugins : confirmation changement + prendre toujours la version la plus haute

*/

export function useImportFromProject() {
  const tabId = useTabPanelId();
  const fireAsync = useFireAsync();
  const dispatch = useDispatch<AsyncDispatch<BulkUpdatesData>>();
  const showImportFromProjectSelectionDialog = useImportFromProjectSelectionDialog();
  const executeBulkUpdate = useExecuteRefresh();

  return useCallback(() => {
    fireAsync(async () => {
      const config = await showImportFromProjectSelectionDialog();
      const bulkUpdatesData = await dispatch(prepareImportFromProject({ id: tabId, config }));
      await executeBulkUpdate(bulkUpdatesData);
    });
  }, [fireAsync]);
}

export function useRefreshToolboxFromOnline() {
  const tabId = useTabPanelId();
  const fireAsync = useFireAsync();
  const dispatch = useDispatch<AsyncDispatch<BulkUpdatesData>>();
  const executeBulkUpdate = useExecuteRefresh();

  return useCallback(() => {
    fireAsync(async () => {
      const bulkUpdatesData = await dispatch(prepareRefreshToolboxFromOnline({ id: tabId }));
      await executeBulkUpdate(bulkUpdatesData);
    });
  }, [fireAsync, dispatch]);
}

function useExecuteRefresh() {
  const tabId = useTabPanelId();
  const dispatch = useDispatch();
  const showBreakingOperations = useShowBreakingOperationsDialog();
  const { enqueueSnackbar } = useSnackbar();

  return useCallback(async (bulkUpdatesData: BulkUpdatesData) => {
    if (bulkUpdatesData.breakingOperations.length > 0) {
      const { status } = await showBreakingOperations(bulkUpdatesData.breakingOperations);
      if(status !== 'ok') {
        return;
      }
    }

    await dispatch(applyBulkUpdates({ id: tabId, serverData: bulkUpdatesData.serverData }));

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
