import React, { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemIcon from '@material-ui/core/ListItemIcon';

import { getRunsIds, getRun } from '../../store/deploy/selectors';
import { AppState } from '../../store/types';
import { RunsIcon } from './icons';
import { useSelection } from './selection';
import { Container, Title } from './layout';
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
  const classes = useStyles();
  const { select } = useSelection();
  const run = useSelector((state: AppState) => getRun(state, id));
  const title = getRunTitle(run);
  const RunIcon = getRunIcon(run);

  return (
    <ListItem button onClick={() => select({ type: 'run', id })}>
      <ListItemIcon>
        <RunIcon />
      </ListItemIcon>

      <ListItemText primary={title} secondary={'secondary'} primaryTypographyProps={{ variant: 'body1' }} secondaryTypographyProps={{ variant: 'body1' }} />

    </ListItem>
  );
};
