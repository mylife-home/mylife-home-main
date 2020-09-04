import React, { FunctionComponent, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';

import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Link from '@material-ui/core/Link';

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
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant='h1'>Démarrage</Typography>
      </Grid>
      <Grid item xs={12}>
        <Typography variant='h2'>Designers</Typography>
      </Grid>
      <Grid item xs={12}>
        <Link component='button' variant='h3' onClick={newCoreDesigner}>Nouveau designer core</Link>
      </Grid>
      <Grid item xs={12}>
        <Link component='button' variant='h3' onClick={newUiDesigner}>Nouveau designer UI</Link>
      </Grid>
      <Grid item xs={12}>
        <Typography variant='h2'>En ligne</Typography>
      </Grid>
      <Grid item xs={12}>
        <Link component='button' variant='h3' onClick={newOnlineView}>Vue du réseau</Link>
      </Grid>
      <Grid item xs={12}>
        <Link component='button' variant='h3' onClick={newDeployManager}>Gestionnaire du déploiement</Link>
      </Grid>
    </Grid>
  );
};

export default StartPage;

function useConnect() {
  const dispatch = useDispatch();
  return useMemo(() => ({
    newTab: (payload: NewTabAction) => dispatch(newTab(payload)),
  }), [dispatch]);
}
