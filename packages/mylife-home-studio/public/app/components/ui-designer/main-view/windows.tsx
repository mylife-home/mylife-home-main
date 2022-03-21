import React, { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';

import { Container, Title } from '../../lib/main-view-layout';
import { WindowIcon } from '../../lib/icons';
import { useTabSelector } from '../../lib/use-tab-selector';
import { AppState } from '../../../store/types';
import { getWindowsIds, getWindow } from '../../../store/ui-designer/selectors';
import { useSelection } from '../selection';
import { WindowsActions, WindowActions } from './common/window-actions';

const useStyles = makeStyles((theme) => ({
  list: {
    width: 900,
  },
}));

const Windows: FunctionComponent = () => {
  const classes = useStyles();
  const windowsIds = useTabSelector(getWindowsIds);

  return (
    <Container
      title={
        <>
          <Title text="Windows" icon={WindowIcon} />
          <WindowsActions />
        </>
      }
    >
      <List disablePadding className={classes.list}>
        {windowsIds.map((id) => (
          <WindowItem key={id} id={id} />
        ))}
      </List>
    </Container>
  );
};

export default Windows;

const WindowItem: FunctionComponent<{ id: string }> = ({ id }) => {
  const { select } = useSelection();
  const window = useSelector((state: AppState) => getWindow(state, id));

  return (
    <ListItem button onClick={() => select({ type: 'window', id })}>
      <ListItemIcon>
        <WindowIcon />
      </ListItemIcon>

      <ListItemText primary={window.windowId} />

      <ListItemSecondaryAction>
        <WindowActions id={id} />
      </ListItemSecondaryAction>
    </ListItem>
  );
};
