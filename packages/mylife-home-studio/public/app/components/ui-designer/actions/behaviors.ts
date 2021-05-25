import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { useTabPanelId } from '../../lib/tab-panel';
import { useFireAsync } from '../../lib/use-error-handling';
import { AsyncDispatch } from '../../../store/types';
import { validateProject, refreshComponentsFromOnline, refreshComponentsFromProject, applyRefreshComponents, deployProject } from '../../../store/ui-designer/actions';
import { RefreshData } from '../../../store/ui-designer/types';
import { UiValidationError } from '../../../../../shared/project-manager';
import { useSnackbar } from '../../dialogs/snackbar';
import { useShowValidationErrorsDialog } from './validation-errors-dialog';
import { useProjectSelectionDialog } from './project-selection-dialog';
import { useShowBreakingOperationsDialog } from './breaking-operations-dialog';

export function useProjectValidation() {
  const tabId = useTabPanelId();
  const dispatch = useDispatch<AsyncDispatch<UiValidationError[]>>();
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
  const showBreakingOperations = useShowBreakingOperationsDialog();
  const { enqueueSnackbar } = useSnackbar();

  return useCallback(async (refreshData: RefreshData) => {
    if (refreshData.breakingOperations.length > 0) {
      const { status } = await showBreakingOperations(refreshData.breakingOperations);
      if(status !== 'ok') {
        return;
      }
    }

    await dispatch(applyRefreshComponents({ id: tabId, serverData: refreshData.serverData }));

    enqueueSnackbar('Les composants ont été mis à jour.', { variant: 'success' });
  }, [dispatch, enqueueSnackbar]);
}

export function useProjectDeploy() {
  const tabId = useTabPanelId();
  const dispatch = useDispatch<AsyncDispatch<{ validationErrors?: UiValidationError[]; deployError?: string; }>>();
  const fireAsync = useFireAsync();
  const showDialog = useShowValidationErrorsDialog();
  const { enqueueSnackbar } = useSnackbar();

  return useCallback(() => {
    fireAsync(async () => {
      const { validationErrors, deployError } = await dispatch(deployProject({ id: tabId }));
      if (validationErrors && validationErrors.length > 0) {
        await showDialog(validationErrors);
      } else if (deployError) {
        throw new Error('Erreur de déploiement : ' + deployError);
      } else {
        enqueueSnackbar('Le projet a été deployé avec succès.', { variant: 'success' });
      }
    });
  }, [tabId, dispatch, fireAsync, showDialog, enqueueSnackbar]);
}