import React, { FunctionComponent, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';

import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';

import { NewTabAction, TabType } from '../../store/tabs/types';
import { CoreDesignerNewTabData } from '../../store/core-designer/types';
import { newTab } from '../../store/tabs/actions';

import * as schema from '../../files/schema';

let idCounter = 0; // FIXME

const StartPage: FunctionComponent = () => {
  const { newTab } = useConnect();

  const newCoreDesigner = () => {
    const id = ++idCounter;
    const data: CoreDesignerNewTabData = schema.vpanelCore;
    newTab({
      id: `core-designer-${id}`,
      title: `Core designer ${id}`,
      type: TabType.CORE_DESIGNER,
      closable: true,
      data
    });
  };

  const newUiDesigner = () => {
    const id = ++idCounter;
    newTab({
      id: `ui-designer-${id}`,
      title: `UI designer ${id}`,
      type: TabType.UI_DESIGNER,
      closable: true,
      data: null
    });
  }

  const newOnlineView = () => {
    const id = ++idCounter;
    newTab({
      id: `online-view-${id}`,
      title: `Vue du réseau ${id}`,
      type: TabType.ONLINE_VIEW,
      closable: true,
      data: null
    });
  }

  const newDeployManager = () => {
    const id = ++idCounter;
    newTab({
      id: `ui-designer-${id}`,
      title: `Gestion du déploiement ${id}`,
      type: TabType.DEPLOY_MANAGER,
      closable: true,
      data: null
    });
  }

  return (
    <Box p={3}>
      <Typography>Démarrage</Typography>
      <Button onClick={newCoreDesigner}>Nouveau designer core</Button>
      <Button onClick={newUiDesigner}>Nouveau designer UI</Button>
      <Button onClick={newOnlineView}>Nouvelle vue du réseau</Button>
      <Button onClick={newDeployManager}>Nouveau gestionnaire du déploiement</Button>
    </Box>
  );
};

export default StartPage;

function useConnect() {
  const dispatch = useDispatch();
  return useMemo(() => ({
    newTab: (payload: NewTabAction) => dispatch(newTab(payload)),
  }), [dispatch]);
}
