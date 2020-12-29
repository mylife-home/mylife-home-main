import React, { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemIcon from '@material-ui/core/ListItemIcon';

import { getRunsIds, getRun } from '../../store/deploy/selectors';
import { AppState } from '../../store/types';
import { Run } from '../../store/deploy/types';
import { useDateAsFormattedDuration, humanizeDuration } from '../lib/durations';
import { Container, Title } from '../lib/main-view-layout';
import { RunsIcon } from './icons';
import { useSelection } from './selection';
import { getRunTitle, getRunIcon } from './run';

const useStyles = makeStyles((theme) => ({
  list: {
    width: 900,
  },
}));

const Runs: FunctionComponent = () => {
  const classes = useStyles();
  const runsIds = useSelector(getRunsIds);

  return (
    <Container
      title={
        <Title text="Exécutions" icon={RunsIcon} />
      }
    >
      <List disablePadding className={classes.list}>
        {runsIds.map((id) => (
          <RunItem key={id} id={id} />
        ))}
      </List>
    </Container>
  );
};

export default Runs;

const RunItem: FunctionComponent<{ id: string }> = ({ id }) => {
  const { select } = useSelection();
  const run = useSelector((state: AppState) => getRun(state, id));
  const title = getRunTitle(run);
  const detail = buildSecondaryText(run);
  const RunIcon = getRunIcon(run);

  return (
    <ListItem button onClick={() => select({ type: 'run', id })}>
      <ListItemIcon>
        <RunIcon />
      </ListItemIcon>

      <ListItemText primary={title} secondary={detail} />

    </ListItem>
  );
};

function buildSecondaryText(run: Run) {
  const creation = useDateAsFormattedDuration(run.creation);
  if(!run.end) {
    return `Démarré il y a ${creation}`;
  }

  const duration = humanizeDuration(run.end.valueOf() - run.creation.valueOf());
  return `Démarré il y a ${creation}, l'exécution a duré ${duration}`;
}