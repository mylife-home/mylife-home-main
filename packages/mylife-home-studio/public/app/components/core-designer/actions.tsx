import React, { FunctionComponent, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import Toolbar from '@material-ui/core/Toolbar';
import PublishIcon from '@material-ui/icons/Publish';
import RefreshIcon from '@material-ui/icons/Refresh';

import { ToolbarIconButton, IconWithBadge } from '../lib/toolbar';
import { InstanceIcon } from '../lib/icons';
import { useTabPanelId } from '../lib/tab-panel';
import { useFireAsync } from '../lib/use-error-handling';
import { FileIcon } from '../deploy/icons';
import { useSnackbar } from '../dialogs/snackbar';
import { AsyncDispatch } from '../../store/types';
import { 
  prepareRefreshToolboxFromFiles, prepareRefreshToolboxFromOnline, applyRefreshToolbox,
  deployToFiles, prepareDeployToOnline, applyDeployToOnline
} from '../../store/core-designer/actions';
import { RefreshToolboxData } from '../../store/core-designer/actions';

const Actions: FunctionComponent<{ className?: string }> = ({ className }) => {
  const refreshToolboxFromFiles = useRefreshToolboxFromFiles();
  const refreshToolboxFromOnline = useRefreshToolboxFromOnline();
  const deployToFiles = useDeployToFiles();
  const deployToOnline = useDeployToOnline();

  return (
    <Toolbar className={className}>
      <ToolbarIconButton title="Rafraîchir la boîte à outils depuis les fichiers de deploiement" icon={<RefreshFromFilesIcon />} onClick={refreshToolboxFromFiles} />
      <ToolbarIconButton title="Rafraîchir la boîte à outils depuis les entités en ligne" icon={<RefreshFromOnlineIcon />} onClick={refreshToolboxFromOnline} />
      <ToolbarIconButton title="Déployer vers un fichier de configuration de déploiement" icon={<DeployToFilesIcon />} onClick={deployToFiles} />
      <ToolbarIconButton title="Déployer sur une instance en ligne" icon={<DeployToOnlineIcon />} onClick={deployToOnline} />
    </Toolbar>
  );
}

export default Actions;

const RefreshFromFilesIcon: FunctionComponent = () => (
  <IconWithBadge
    main={<RefreshIcon />}
    badge={<FileIcon />}
  />
);

const RefreshFromOnlineIcon: FunctionComponent = () => (
  <IconWithBadge
    main={<RefreshIcon />}
    badge={<InstanceIcon />}
  />
);

const DeployToFilesIcon: FunctionComponent = () => (
  <IconWithBadge
    main={<PublishIcon />}
    badge={<FileIcon />}
  />
);

const DeployToOnlineIcon: FunctionComponent = () => (
  <IconWithBadge
    main={<PublishIcon />}
    badge={<InstanceIcon />}
  />
);

function useRefreshToolboxFromFiles() {
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

function useRefreshToolboxFromOnline() {
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

function useDeployToFiles() {
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


function useDeployToOnline() {
  const tabId = useTabPanelId();

  return useCallback(() => {
    console.log('TODO');
  }, []);
}
