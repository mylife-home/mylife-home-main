import React, { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import AddIcon from '@material-ui/icons/Add';
import EditIcon from '@material-ui/icons/Edit';
import FileCopyIcon from '@material-ui/icons/FileCopy';

import { Container, Title } from '../../lib/main-view-layout';
import { WindowIcon } from '../../lib/icons';
import { useTabSelector } from '../../lib/use-tab-selector';
import DeleteButton from '../../lib/delete-button';
import { getWindowsIds } from '../../../store/ui-designer/selectors';
import { useSelection } from '../selection';
import { useWindowsActions, useWindowActions } from './common/window-actions';

const useStyles = makeStyles((theme) => ({
  newButton: {
    color: theme.palette.success.main,
  },
  list: {
    width: 900,
  },
}));

const Windows: FunctionComponent = () => {
  const classes = useStyles();
  const windowsIds = useTabSelector(getWindowsIds);
  const { onNew } = useWindowsActions();

  return (
    <Container
      title={
        <>
          <Title text="Windows" icon={WindowIcon} />

          <Tooltip title="Nouvelle fenêtre">
            <IconButton className={classes.newButton} onClick={onNew}>
              <AddIcon />
            </IconButton>
          </Tooltip>
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
  const { onDuplicate, onRename, onRemove } = useWindowActions(id);

  return (
    <ListItem button onClick={() => select({ type: 'window', id })}>
      <ListItemIcon>
        <WindowIcon />
      </ListItemIcon>

      <ListItemText primary={id} />

      <ListItemSecondaryAction>
        <Tooltip title="Dupliquer">
          <IconButton onClick={onDuplicate}>
            <FileCopyIcon />
          </IconButton>
        </Tooltip>

        <Tooltip title="Renommer">
          <IconButton onClick={onRename}>
            <EditIcon />
          </IconButton>
        </Tooltip>

        <DeleteButton icon tooltip="Supprimer" onConfirmed={onRemove} />
      </ListItemSecondaryAction>
    </ListItem>
  );
};
