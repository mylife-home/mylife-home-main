import React, { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Link from '@material-ui/core/Link';

import { AppState } from '../../store/types';
import { Run } from '../../store/deploy/types';
import { getRun } from '../../store/deploy/selectors';
import { humanizeDuration } from '../lib/durations';
import { RunningIcon, SuccessIcon, FailureIcon } from './icons';
import { useSelection, useResetSelectionIfNull } from './selection';
import { Container, Title } from './layout';

const useStyles = makeStyles((theme) => ({
  gridContainer: {
    width: 900,
    margin: theme.spacing(3),
  },
}));

const STATUSES = {
  created: 'Créé',
  running: "En cours d'exécution",
  ended: 'Terminé',
};

const RunDisplay: FunctionComponent<{ id: string }> = ({ id }) => {
  const classes = useStyles();
  const run = useSelector((state: AppState) => getRun(state, id));
  const { select } = useSelection();

  // handle run that becomes null
  useResetSelectionIfNull(run);

  if (!run) {
    return null;
  }

  return (
    <Container title={<Title text={getRunTitle(run)} icon={getRunIcon(run)} />}>
      <Grid container spacing={3} className={classes.gridContainer}>
        <Grid item xs={2}>
          <Typography>État</Typography>
        </Grid>
        <Grid item xs={10}>
          <Typography>{STATUSES[run.status]}</Typography>
        </Grid>

        <Grid item xs={2}>
          <Typography>Recette</Typography>
        </Grid>
        <Grid item xs={10}>
          <Link component="button" variant="body1" onClick={() => select({ type: 'recipe', id: run.recipe })}>
            {run.recipe}
          </Link>
        </Grid>

        <Grid item xs={2}>
          <Typography>Début</Typography>
        </Grid>
        <Grid item xs={10}>
          <Typography>{run.creation.toLocaleString('fr-FR')}</Typography>
        </Grid>

        {run.end && (
          <>
            <Grid item xs={2}>
              <Typography>Fin</Typography>
            </Grid>
            <Grid item xs={10}>
              <Typography>{run.end.toLocaleString('fr-FR')}</Typography>
            </Grid>

            <Grid item xs={2}>
              <Typography>Durée</Typography>
            </Grid>
            <Grid item xs={10}>
              <Typography>{humanizeDuration(run.end.valueOf() - run.creation.valueOf())}</Typography>
            </Grid>
          </>
        )}

        {run.err && (
          <>
            <Grid item xs={2}>
              <Typography>Erreur</Typography>
            </Grid>
            <Grid item xs={10}>
              <Typography>TODO</Typography>
            </Grid>
          </>
        )}
      </Grid>
    </Container>
  );
};

export default RunDisplay;

const useIconsStyles = makeStyles((theme) => ({
  successIcon: {
    color: theme.palette.success.main,
  },
  failureIcon: {
    color: theme.palette.error.main,
  },
}));

const ColoredSuccessIcon: FunctionComponent = () => {
  const classes = useIconsStyles();
  return <SuccessIcon className={classes.successIcon} />;
};

const ColoredFailureIcon: FunctionComponent = () => {
  const classes = useIconsStyles();
  return <FailureIcon className={classes.failureIcon} />;
};

export function getRunTitle(run: Run) {
  // id is 'run-XXX'
  return `#${run.id.substr(4)} - ${run.recipe}`;
}

export function getRunIcon(run: Run) {
  if (run.status !== 'ended') {
    return RunningIcon;
  }

  return run.err ? ColoredFailureIcon : ColoredSuccessIcon;
}
