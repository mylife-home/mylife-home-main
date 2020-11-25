import React, { Fragment, FunctionComponent } from 'react';
import { useSelector } from 'react-redux';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Link from '@material-ui/core/Link';
import Divider from '@material-ui/core/Divider';

import { AppState } from '../../store/types';
import { Run, RunError, RunLogSeverity } from '../../store/deploy/types';
import { getRun } from '../../store/deploy/selectors';
import { humanizeDuration } from '../lib/durations';
import VirtualizedTable, { ColumnDefinition } from '../lib/virtualized-table';
import { RunningIcon, SuccessIcon, FailureIcon } from './icons';
import { useSelection, useResetSelectionIfNull } from './selection';
import { Container, Title } from './layout';

const useStyles = makeStyles((theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  props: {},
  logs: {
    flex: 1,
  },
}));

const RunDisplay: FunctionComponent<{ id: string }> = ({ id }) => {
  const classes = useStyles();
  const run = useSelector((state: AppState) => getRun(state, id));

  // handle run that becomes null
  useResetSelectionIfNull(run);

  if (!run) {
    return null;
  }

  return (
    <Container title={<Title text={getRunTitle(run)} icon={getRunIcon(run)} />}>
      <div className={classes.container}>
        <RunProps id={run.id} className={classes.props} />
        <Divider />
        <RunLogs id={run.id} className={classes.logs} />
      </div>
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

const usePropsStyles = makeStyles((theme) => ({
  container: {
    width: '100%',
    margin: theme.spacing(3),
  },
  error: {
    color: theme.palette.error.main,
  },
}));

const STATUSES = {
  created: 'Créé',
  running: "En cours d'exécution",
  ended: 'Terminé',
};

const RunProps: FunctionComponent<{ className?: string; id: string }> = ({ className, id }) => {
  const classes = usePropsStyles();
  const run = useSelector((state: AppState) => getRun(state, id));
  const { select } = useSelection();
  const error = run.err;

  return (
    <Grid container spacing={3} className={clsx(classes.container, className)}>
      <Grid item xs={1}>
        <Typography>État</Typography>
      </Grid>
      <Grid item xs={11}>
        <Typography>{STATUSES[run.status]}</Typography>
      </Grid>

      <Grid item xs={1}>
        <Typography>Recette</Typography>
      </Grid>
      <Grid item xs={11}>
        <Link component="button" variant="body1" onClick={() => select({ type: 'recipe', id: run.recipe })}>
          {run.recipe}
        </Link>
      </Grid>

      <Grid item xs={1}>
        <Typography>Début</Typography>
      </Grid>
      <Grid item xs={11}>
        <Typography>{formatTimestamp(run.creation)}</Typography>
      </Grid>

      {run.end && (
        <>
          <Grid item xs={1}>
            <Typography>Fin</Typography>
          </Grid>
          <Grid item xs={11}>
            <Typography>{formatTimestamp(run.end)}</Typography>
          </Grid>

          <Grid item xs={1}>
            <Typography>Durée</Typography>
          </Grid>
          <Grid item xs={11}>
            <Typography>{humanizeDuration(run.end.valueOf() - run.creation.valueOf())}</Typography>
          </Grid>
        </>
      )}

      {error && (
        <>
          <Grid item xs={1}>
            <Typography>Erreur</Typography>
          </Grid>
          <Grid item xs={11}>
            <Typography className={classes.error}>{formatError(error)}</Typography>
          </Grid>
        </>
      )}
    </Grid>
  );
};

const RunLogs: FunctionComponent<{ className?: string; id: string }> = ({ className, id }) => {
  const run = useSelector((state: AppState) => getRun(state, id));

  const severityRenderer = (value: RunLogSeverity) => <Severity value={value} />;
  const textRenderer = (value: string) => <Text value={value} />;

  const columns: ColumnDefinition[] = [
    { dataKey: 'date', width: 150, headerRenderer: 'Date/Heure', cellDataGetter: ({ rowData }) => formatTimestamp(rowData.date) },
    { dataKey: 'severity', width: 100, headerRenderer: 'Gravité', cellRenderer: severityRenderer },
    { dataKey: 'category', width: 500, headerRenderer: 'Catégorie' },
    { dataKey: 'message', headerRenderer: 'Message', cellRenderer: textRenderer },
  ];

  return <VirtualizedTable data={run.logs} columns={columns} className={className} />;
};

const useSeverityStyles = makeStyles((theme) => ({
  error: {
    // red
    color: '#cd3131',
  },
  warning: {
    // magenta
    color: '#bc05bc',
  },
  info: {
    // cyan
    color: '#0598bc',
  },
  debug: {
    // yellow
    color: '#949800',
  },
}));

const Severity: FunctionComponent<{ value: RunLogSeverity }> = ({ value }) => {
  const classes = useSeverityStyles();
  return (
    <Typography className={classes[value]} variant="body2">
      {value.toUpperCase()}
    </Typography>
  );
};

const Text: FunctionComponent<{ value: string }> = ({ value }) => (
  <Typography variant="body2" noWrap>
    {value}
  </Typography>
);

function formatTimestamp(value: Date) {
  return value.toLocaleString('fr-FR');
}

function formatError(error: RunError) {
  const lines = error.stack.split('\n');
  return lines.map((line, index) => (
    <Fragment key={index}>
      {line}
      {index < lines.length - 1 && <br />}
    </Fragment>
  ));
}
