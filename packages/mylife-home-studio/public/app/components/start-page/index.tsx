import React, { FunctionComponent, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';

import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Link from '@material-ui/core/Link';

import { NewTabData } from '../../store/tabs/types';
import { CoreDesignerNewTabData } from '../../store/core-designer/types';
import { 
  newCoreDesignerTab, newUiDesignerTab,
  newOnlineComponentsViewTab, newOnlineEntitiesViewTab, newOnlineLogsViewTab, 
  newDeployManagerTab
} from '../../store/tabs/actions';

import * as schema from '../../files/schema';

const useStyles = makeStyles((theme) => ({
  container: {
    margin: theme.spacing(3)
  },
  link: {
    marginLeft: theme.spacing(3)
  }
}));

let counter = 0;

const StartPage: FunctionComponent = () => {
  const { 
    newCoreDesignerTab, newUiDesignerTab, 
    newOnlineComponentsViewTab: newOnlineComponentsView, newOnlineEntitiesViewTab: newOnlineEntitiesView, newOnlineLogsViewTab: newOnlineLogsView, 
    newDeployManagerTab: newDeployManager
  } = useConnect();

  const classes = useStyles();

  const newCoreDesigner = () => {
    const data: CoreDesignerNewTabData = schema.vpanelCore;
    newCoreDesignerTab(`Core designer ${++counter}`, data);
  };

  const newUiDesigner = () => {
    newUiDesignerTab(`UI designer ${++counter}`, null);
  }

  return (
    <Grid container spacing={3} className={classes.container}>
      <Grid item xs={12}>
        <Typography variant='h6'>Designers</Typography>
      </Grid>
      <Grid item xs={12}>
        <Link className={classes.link} component='button' variant='body1' onClick={newCoreDesigner}>Nouveau designer core</Link>
      </Grid>
      <Grid item xs={12}>
        <Link className={classes.link} component='button' variant='body1' onClick={newUiDesigner}>Nouveau designer UI</Link>
      </Grid>
      <Grid item xs={12}>
        <Typography variant='h6'>En ligne</Typography>
      </Grid>
      <Grid item xs={12}>
        <Link className={classes.link} component='button' variant='body1' onClick={newOnlineLogsView}>Logs</Link>
      </Grid>
      <Grid item xs={12}>
        <Link className={classes.link} component='button' variant='body1' onClick={newOnlineEntitiesView}>Vue des entités</Link>
      </Grid>
      <Grid item xs={12}>
        <Link className={classes.link} component='button' variant='body1' onClick={newOnlineComponentsView}>Vue des composants</Link>
      </Grid>
      <Grid item xs={12}>
        <Link className={classes.link} component='button' variant='body1' onClick={newDeployManager}>Gestionnaire du déploiement</Link>
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
    newOnlineComponentsViewTab: () => dispatch(newOnlineComponentsViewTab()),
    newOnlineEntitiesViewTab: () => dispatch(newOnlineEntitiesViewTab()),
    newOnlineLogsViewTab: () => dispatch(newOnlineLogsViewTab()),
    newDeployManagerTab: () => dispatch(newDeployManagerTab()),
  }), [dispatch]);
}
