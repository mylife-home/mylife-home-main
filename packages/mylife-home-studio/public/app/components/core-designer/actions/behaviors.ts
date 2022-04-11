import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { useTabPanelId } from '../../lib/tab-panel';
import { useFireAsync } from '../../lib/use-error-handling';
import { useSnackbar } from '../../dialogs/snackbar';
import { useBusy } from '../../dialogs/busy';
import { useShowChangesDialog } from './changes-selection-dialog';
import { AsyncDispatch } from '../../../store/types';
import { BulkUpdatesData, BulkUpdatesStats, coreValidation, FilesDeployData, OnlineDeployData, FilesDeployResult } from '../../../store/core-designer/types';
import { 
  prepareImportFromProject, prepareImportFromOnline, applyBulkUpdates, 
  prepareDeployToFiles, applyDeployToFiles, prepareDeployToOnline, applyDeployToOnline, validateProject
} from '../../../store/core-designer/actions';
import { useImportFromProjectSelectionDialog, useImportFromOnlineSelectionDialog } from './import-selection-dialog';
import { useShowValidationDialog } from './validation-dialog';
import { useShowDhowDeployToFilesDialog } from './deploy-to-files-dialog';
import { useShowDhowDeployToOnlineDialog } from './deploy-to-online-dialog';

export function useImportFromProject() {
  const tabId = useTabPanelId();
  const fireAsync = useFireAsync();
  const dispatch = useDispatch();
  const showImportFromProjectSelectionDialog = useImportFromProjectSelectionDialog();
  const executeBulkUpdate = useExecuteRefresh();

  return useCallback(() => {
    fireAsync(async () => {
      const { status, config } = await showImportFromProjectSelectionDialog();
      if (status !== 'ok') {
        return;
      }

      const bulkUpdatesData = await (dispatch as AsyncDispatch<BulkUpdatesData>)(prepareImportFromProject({ tabId, config }));
      await executeBulkUpdate(bulkUpdatesData);
    });
  }, [fireAsync, dispatch, showImportFromProjectSelectionDialog, executeBulkUpdate]);
}

export function useImportFromOnline() {
  const tabId = useTabPanelId();
  const fireAsync = useFireAsync();
  const dispatch = useDispatch();
  const showImportFromOnlineSelectionDialog = useImportFromOnlineSelectionDialog();
  const executeBulkUpdate = useExecuteRefresh();

  return useCallback(() => {
    fireAsync(async () => {
      const { status, config } = await showImportFromOnlineSelectionDialog();
      if (status !== 'ok') {
        return;
      }

      const bulkUpdatesData = await (dispatch as AsyncDispatch<BulkUpdatesData>)(prepareImportFromOnline({ tabId, config }));
      await executeBulkUpdate(bulkUpdatesData);
    });
  }, [fireAsync, dispatch, showImportFromOnlineSelectionDialog, executeBulkUpdate]);
}

function useExecuteRefresh() {
  const tabId = useTabPanelId();
  const dispatch = useDispatch<AsyncDispatch<BulkUpdatesStats>>();
  const showChangesDialog = useShowChangesDialog();
  const { enqueueSnackbar } = useSnackbar();

  return useCallback(async (bulkUpdatesData: BulkUpdatesData) => {
    const { changes, serverData } = bulkUpdatesData;
    if (changes.length === 0) {
      enqueueSnackbar('Le projet est déjà à jour.', { variant: 'info' });
      return;
    }

    const { status, selection } = await showChangesDialog(changes);
    if (status !== 'ok') {
      return;
    }

    const stats = await dispatch(applyBulkUpdates({ tabId, selection, serverData }));

    enqueueSnackbar(formatRefreshNotification(stats), { variant: 'success' });
  }, [dispatch, enqueueSnackbar]);
}

function formatRefreshNotification(stats: BulkUpdatesStats) {
  let pluginsText = null;
  let componentsText = null;
  let templatesText = null;
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

  if (stats.templates === 1) {
    templatesText = `${stats.templates} template`;
  } else if (stats.templates > 1) {
    templatesText = `${stats.templates} templates`;
  }

  if (stats.bindings === 1) {
    bindingsText = `${stats.bindings} binding`;
  } else if (stats.bindings > 1) {
    bindingsText = `${stats.bindings} bindings`;
  }

  const list = [pluginsText, componentsText, templatesText, bindingsText].filter(item => item).join(', ');
  const total = stats.plugins + stats.components + stats.templates + stats.bindings;
  return total > 1 ? `${list} ont été mis à jour` : `${list} a été mis à jour`;
}

export function useProjectValidation() {
  const tabId = useTabPanelId();
  const dispatch = useDispatch();
  const fireAsync = useFireAsync();
  const showDialog = useShowValidationDialog();
  const { enqueueSnackbar } = useSnackbar();

  return useCallback(() => {
    fireAsync(async () => {
      const errors = await (dispatch as AsyncDispatch<coreValidation.Item[]>)(validateProject({ tabId }));
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
  const validate = useValidate();
  const showDhowDeployToFilesDialog = useShowDhowDeployToFilesDialog();
  const { enqueueSnackbar } = useSnackbar();
  const wrapBusy = useBusy('Déploiement en cours ...');

  return useCallback(() => {
    fireAsync(async () => {
      const deployData = await (dispatch as AsyncDispatch<FilesDeployData>)(prepareDeployToFiles({ tabId }));
      if (!await validate(deployData.validation)) {
        return;
      }

      const { changes, files, serverData } = deployData;
      const { status, bindingsInstanceName } = await showDhowDeployToFilesDialog(deployData.bindingsInstanceName, changes, files);
      if (status === 'cancel') {
        return;
      }

      const { writtenFilesCount } = await wrapBusy(async () => {
        return await (dispatch as AsyncDispatch<FilesDeployResult>)(applyDeployToFiles({ tabId, bindingsInstanceName, serverData }));
      }) as FilesDeployResult;

      const text = writtenFilesCount < 2 ? `${writtenFilesCount} fichier créé` : `${writtenFilesCount} Fichiers créés`;
      enqueueSnackbar(text, { variant: 'success' });
    });
  }, [fireAsync, dispatch]);
}

export function useDeployToOnline() {
  const tabId = useTabPanelId();
  const dispatch = useDispatch();
  const fireAsync = useFireAsync();
  const validate = useValidate();
  const showDhowDeployToOnlineDialog = useShowDhowDeployToOnlineDialog();
  const { enqueueSnackbar } = useSnackbar();
  const wrapBusy = useBusy('Déploiement en cours ...');

  return useCallback(() => {
    fireAsync(async () => {
      const { validation, changes, serverData } = await (dispatch as AsyncDispatch<OnlineDeployData>)(prepareDeployToOnline({ tabId }));
      if (!await validate(validation)) {
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
      
      await wrapBusy(async () => {
        await dispatch(applyDeployToOnline({ tabId, serverData }));
      });

      enqueueSnackbar('Le projet a été deployé avec succès.', { variant: 'success' });
    });
  }, [fireAsync, dispatch]);
}

function useValidate() {
  const showValidationDialog = useShowValidationDialog({ isConfirm: true });

  return useCallback(async (validation: coreValidation.Item[]) => {
    if (validation.length === 0) {
      return true;
    }

    const { status } = await showValidationDialog(validation);
    return status === 'ok';
  }, [showValidationDialog]);
}