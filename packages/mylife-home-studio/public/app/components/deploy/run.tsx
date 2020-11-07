import React, { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';

import { AppState } from '../../store/types';
import { RunningIcon, SuccessIcon, FailureIcon } from './icons';
import { useSelection } from './selection';
import { Title } from './layout';
import { Run } from '../../store/deploy/types';
import { getRun } from '../../store/deploy/selectors';

const RunDisplay: FunctionComponent<{ id: string; }> = ({ id }) => {
  const { selection } = useSelection();
  const run = useSelector((state: AppState) => getRun(state, id));

  // TODO: handle run that becomes null

  return (
    <Title text={getRunTitle(run)} icon={getRunIcon(run)} />
  );
};

export default RunDisplay;

const useStyles = makeStyles((theme) => ({
  successIcon: {
    color: theme.palette.success.main,
  },
  failureIcon: {
    color: theme.palette.error.main,
  },
}));

const ColoredSuccessIcon: FunctionComponent = () => {
  const classes = useStyles();
  return <SuccessIcon className={classes.successIcon} />;
};

const ColoredFailureIcon: FunctionComponent = () => {
  const classes = useStyles();
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
