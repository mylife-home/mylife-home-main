import React, { FunctionComponent, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';

import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Link from '@material-ui/core/Link';

import { TabType, NewTabData } from '../../store/tabs/types';
import { CoreDesignerNewTabData } from '../../store/core-designer/types';
import { newCoreDesignerTab, newUiDesignerTab, newOnlineViewTab, newDeployManagerTab } from '../../store/tabs/actions';

import * as schema from '../../files/schema';

let counter = 0;

const StartPage: FunctionComponent = () => {
  const { newCoreDesignerTab, newUiDesignerTab, newOnlineViewTab: newOnlineView, newDeployManagerTab: newDeployManager } = useConnect();

  const newCoreDesigner = () => {
    const data: CoreDesignerNewTabData = schema.vpanelCore;
    newCoreDesignerTab(`Core designer ${++counter}`, data);
  };

  const newUiDesigner = () => {
    newUiDesignerTab(`UI designer ${++counter}`, null);
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
    newCoreDesignerTab: (title: string, data: CoreDesignerNewTabData) => dispatch(newCoreDesignerTab({ title, data })),
    newUiDesignerTab: (title: string, data: NewTabData) => dispatch(newUiDesignerTab({ title, data })),
    newOnlineViewTab: () => dispatch(newOnlineViewTab()),
    newDeployManagerTab: () => dispatch(newDeployManagerTab()),
  }), [dispatch]);
}
