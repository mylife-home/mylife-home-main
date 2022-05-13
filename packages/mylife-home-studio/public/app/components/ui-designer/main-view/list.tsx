import React, { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';

import { Container, Title } from '../../lib/main-view-layout';
import { WindowIcon, TemplateIcon } from '../../lib/icons';
import { useTabSelector } from '../../lib/use-tab-selector';
import { AppState } from '../../../store/types';
import { getWindowsIds, getWindow, getTemplatesIds, getTemplate } from '../../../store/ui-designer/selectors';
import { useSelection } from '../selection';
import { WindowsActions, WindowActions } from './common/window-actions';
import { TemplatesActions, TemplateActions } from './common/template-actions';

const useStyles = makeStyles((theme) => ({
  list: {
    width: 900,
  },
}));

export const Windows: FunctionComponent = () => {
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

export const Templates: FunctionComponent = () => {
  const classes = useStyles();
  const templatesIds = useTabSelector(getTemplatesIds);

  return (
    <Container
      title={
        <>
          <Title text="Templates" icon={TemplateIcon} />
          <TemplatesActions />
        </>
      }
    >
      <List disablePadding className={classes.list}>
        {templatesIds.map((id) => (
          <TemplateItem key={id} id={id} />
        ))}
      </List>
    </Container>
  );
};

const TemplateItem: FunctionComponent<{ id: string }> = ({ id }) => {
  const { select } = useSelection();
  const template = useSelector((state: AppState) => getTemplate(state, id));

  return (
    <ListItem button onClick={() => select({ type: 'template', id })}>
      <ListItemIcon>
        <TemplateIcon />
      </ListItemIcon>

      <ListItemText primary={template.templateId} />

      <ListItemSecondaryAction>
        <TemplateActions id={id} />
      </ListItemSecondaryAction>
    </ListItem>
  );
};
