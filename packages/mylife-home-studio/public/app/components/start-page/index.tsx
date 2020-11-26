import React, { FunctionComponent } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Link from '@material-ui/core/Link';

import { useActions } from '../lib/use-actions';
import { CoreDesignerNewTabData } from '../../store/core-designer/types';
import { 
  newCoreDesignerTab, newUiDesignerTab,
  newOnlineComponentsViewTab, newOnlineHistoryTab, newOnlineInstancesViewTab, newOnlineLogsTab, 
  newDeployTab
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
    newOnlineComponentsViewTab: newOnlineComponentsView, newOnlineHistoryTab: newOnlineHistory, newOnlineInstancesViewTab: newOnlineInstancesView, newOnlineLogsTab: newOnlineLogs, 
    newDeployTab: newDeploy
  } = useConnect();

  const classes = useStyles();

  const newCoreDesigner = () => {
    const data: CoreDesignerNewTabData = schema.vpanelCore;
    newCoreDesignerTab({ title: `Core designer ${++counter}`, data });
  };

  const newUiDesigner = () => {
    newUiDesignerTab({ title: `UI designer ${++counter}`, data: null });
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
        <Link className={classes.link} component='button' variant='body1' onClick={newOnlineLogs}>Logs</Link>
      </Grid>
      <Grid item xs={12}>
        <Link className={classes.link} component='button' variant='body1' onClick={newOnlineHistory}>Historique</Link>
      </Grid>
      <Grid item xs={12}>
        <Link className={classes.link} component='button' variant='body1' onClick={newOnlineInstancesView}>Vue des instances</Link>
      </Grid>
      <Grid item xs={12}>
        <Link className={classes.link} component='button' variant='body1' onClick={newOnlineComponentsView}>Vue des composants</Link>
      </Grid>
      <Grid item xs={12}>
        <Link className={classes.link} component='button' variant='body1' onClick={newDeploy}>Déploiement</Link>
      </Grid>
    </Grid>
  );
};

export default StartPage;

function useConnect() {
  return useActions({
    newCoreDesignerTab,
    newUiDesignerTab,
    newOnlineComponentsViewTab,
    newOnlineHistoryTab,
    newOnlineInstancesViewTab,
    newOnlineLogsTab,
    newDeployTab,
  });
}
