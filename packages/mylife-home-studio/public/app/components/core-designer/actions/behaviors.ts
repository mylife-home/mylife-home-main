import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { useTabPanelId } from '../../lib/tab-panel';
import { useFireAsync } from '../../lib/use-error-handling';
import { useSnackbar } from '../../dialogs/snackbar';
import { useShowChangesDialog } from './changes-selection-dialog';
import { AsyncDispatch } from '../../../store/types';
import { BulkUpdatesData, BulkUpdatesStats, coreImportData, CoreValidationError, FilesDeployData, OnlineDeployData, FilesDeployResult } from '../../../store/core-designer/types';
import { 
  prepareImportFromProject, prepareRefreshToolboxFromOnline, applyBulkUpdates, 
  prepareDeployToFiles, applyDeployToFiles, prepareDeployToOnline, applyDeployToOnline, validateProject
} from '../../../store/core-designer/actions';
import { useImportFromProjectSelectionDialog } from './import-from-project-selection-dialog';
import { useShowValidationErrorsDialog, useConfirmValidationErrorsDialog } from './validation-errors-dialog';
import { useShowDhowDeployToFilesDialog } from './deploy-to-files-dialog';
import { useShowDhowDeployToOnlineDialog } from './deploy-to-online-dialog';

export function useImportFromProject() {
  const tabId = useTabPanelId();
  const fireAsync = useFireAsync();
  const dispatch = useDispatch<AsyncDispatch<BulkUpdatesData>>();
  const showImportFromProjectSelectionDialog = useImportFromProjectSelectionDialog();
  const executeBulkUpdate = useExecuteRefresh();

  return useCallback(() => {
    fireAsync(async () => {
      const { status, config } = await showImportFromProjectSelectionDialog();
      if (status !== 'ok') {
        return;
      }

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
  const dispatch = useDispatch<AsyncDispatch<BulkUpdatesStats>>();
  const showChangesDialog = useShowChangesDialog();
  const { enqueueSnackbar } = useSnackbar();

  return useCallback(async (bulkUpdatesData: BulkUpdatesData) => {
    const { changes, serverData } = bulkUpdatesData;
    if (areChangesEmpty(changes)) {
      enqueueSnackbar('Le projet est déjà à jour.', { variant: 'info' });
      return;
    }

    const { status, selection } = await showChangesDialog(changes);
    if (status !== 'ok') {
      return;
    }

    const stats = await dispatch(applyBulkUpdates({ id: tabId, selection, serverData }));

    enqueueSnackbar(formatRefreshNotification(stats), { variant: 'success' });
  }, [dispatch, enqueueSnackbar]);
}

function formatRefreshNotification(stats: BulkUpdatesStats) {
  let pluginsText = null;
  let componentsText = null;
  let bindingsText = null;

  if (stats.plugins === 1) {
    pluginsText = `${stats.plugins} plugin`;
  } else if (stats.plugins > 1) {
    pluginsText = `${stats.plugins} plugins`;
  }

  if (stats.components === 1) {
    componentsText = `${stats.components} composant`;
  } else if (stats.components > 1) {
    componentsText = `${stats.components} composants`;
  }

  if (stats.bindings === 1) {
    bindingsText = `${stats.bindings} binding`;
  } else if (stats.bindings > 1) {
    bindingsText = `${stats.bindings} bindings`;
  }

  const list = [pluginsText, componentsText, bindingsText].filter(item => item).join(', ');
  const total = stats.plugins + stats.components + stats.bindings;
  return total > 1 ? `${list} ont été mis à jour` : `${list} a été mis à jour`;
}

function areChangesEmpty(changes: coreImportData.Changes) {
  return isChangeSetEmpty(changes.plugins) && isChangeSetEmpty(changes.components);
}

function isChangeSetEmpty<T>(changeSet: coreImportData.ItemChanges<T>) {
  return isObjectEmpty(changeSet.adds)
  && isObjectEmpty(changeSet.updates)
  && isObjectEmpty(changeSet.deletes)
}

function isObjectEmpty(object: {}) {
  return Object.keys(object).length === 0;
}

export function useProjectValidation() {
  const tabId = useTabPanelId();
  const dispatch = useDispatch<AsyncDispatch<CoreValidationError[]>>();
  const fireAsync = useFireAsync();
  const showDialog = useShowValidationErrorsDialog();
  const { enqueueSnackbar } = useSnackbar();

  return useCallback(() => {
    fireAsync(async () => {
      const errors = await dispatch(validateProject({ id: tabId }));
      if (errors.length === 0) {
        enqueueSnackbar('Le projet a été validé sans erreur.', { variant: 'success' });
      } else {
        await showDialog(errors);
      }
    });
  }, [tabId, dispatch, fireAsync, showDialog, enqueueSnackbar]);
}

export function useDeployToFiles() {
  const tabId = useTabPanelId();
  const dispatch = useDispatch();
  const fireAsync = useFireAsync();
  const confirmValidationErrorsDialog = useConfirmValidationErrorsDialog();
  const showDhowDeployToFilesDialog = useShowDhowDeployToFilesDialog();
  const { enqueueSnackbar } = useSnackbar();

  return useCallback(() => {
    fireAsync(async () => {
      const deployData = await (dispatch as AsyncDispatch<FilesDeployData>)(prepareDeployToFiles({ id: tabId }));
      if (deployData.errors.length > 0) {
        const { status } = await confirmValidationErrorsDialog(deployData.errors);
        if (status === 'cancel') {
          return;
        }
      }

      const { changes, files, serverData } = deployData;
      const { status, bindingsInstanceName } = await showDhowDeployToFilesDialog(deployData.bindingsInstanceName, changes, files);
      if (status === 'cancel') {
        return;
      }

      const { writtenFilesCount } = await (dispatch as AsyncDispatch<FilesDeployResult>)(applyDeployToFiles({ id: tabId, bindingsInstanceName, serverData }));

      const text = writtenFilesCount < 2 ? `${writtenFilesCount} fichier créé` : `${writtenFilesCount} Fichiers créés`;
      enqueueSnackbar(text, { variant: 'success' });
    });
  }, [fireAsync, dispatch]);
}


export function useDeployToOnline() {
  const tabId = useTabPanelId();
  const dispatch = useDispatch();
  const fireAsync = useFireAsync();
  const showValidationErrorsDialog = useShowValidationErrorsDialog();
  const showDhowDeployToOnlineDialog = useShowDhowDeployToOnlineDialog();
  const { enqueueSnackbar } = useSnackbar();

  return useCallback(() => {
    fireAsync(async () => {
      const { errors, changes, serverData } = await (dispatch as AsyncDispatch<OnlineDeployData>)(prepareDeployToOnline({ id: tabId }));
      if (errors.length > 0) {
        await showValidationErrorsDialog(errors);
        // cannot go further if online validation failed
        return;
      }

      if (changes.bindings.length === 0 && changes.components.length === 0) {
        enqueueSnackbar('Le déploiement du projet est déjà à jour, rien à déployer.', { variant: 'info' });
        return;  
      }

      const { status } = await showDhowDeployToOnlineDialog(changes);
      if (status === 'cancel') {
        return;
      }

      await dispatch(applyDeployToOnline({ id: tabId, serverData }));

      enqueueSnackbar('Le projet a été deployé avec succès.', { variant: 'success' });
    });
  }, [fireAsync, dispatch]);}
