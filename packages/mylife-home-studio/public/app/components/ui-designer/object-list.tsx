import React, { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import SvgIcon from '@material-ui/core/SvgIcon';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Collapse from '@material-ui/core/Collapse';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import { ProjectIcon, WindowIcon, ImageIcon, ComponentIcon } from '../lib/icons';
import { useTabPanelId } from '../lib/tab-panel';
import { AppState } from '../../store/types';
import { getComponentsIds, getResourcesIds, getWindowsIds } from '../../store/ui-designer/selectors';

const useStyles = makeStyles((theme) => ({
  container: {
    width: '100%',
    height: '100%',
    overflow: 'auto',
  },
  list: {
    width: '100%',
  },
  nested: {
    paddingLeft: theme.spacing(8),
  },
}));

const ObjectList: FunctionComponent = () => {
  const classes = useStyles();
  const tabId = useTabPanelId();
  const windows = useSelector((state: AppState) => getWindowsIds(state, tabId));
  const resources = useSelector((state: AppState) => getResourcesIds(state, tabId));
  const components = useSelector((state: AppState) => getComponentsIds(state, tabId));

  return (
    <div className={classes.container}>
      <List component="nav" className={classes.list}>
        <Item title="Projet" icon={ProjectIcon} />

        <Group title="Fenêtres" icon={WindowIcon} initialOpen>
          {windows.map(id => <Item key={id} title={id} nested />)}
        </Group>

        <Group title="Ressources" icon={ImageIcon}>
          {resources.map(id => <Item key={id} title={id} nested />)}
        </Group>

        <Group title="Composants" icon={ComponentIcon}>
          {components.map(id => <Item key={id} title={id} nested />)}
        </Group>
      </List>
    </div>
  );
};

export default ObjectList;

const Group: FunctionComponent<{ title: string; icon: typeof SvgIcon; initialOpen?: boolean }> = ({ title, icon, initialOpen = false, children }) => {
  const Icon = icon;

  const [open, setOpen] = React.useState(initialOpen);

  const handleClick = () => {
    setOpen(!open);
  };

  return (
    <>
      <ListItem button onClick={handleClick}>
        <ListItemIcon>
          <Icon />
        </ListItemIcon>
        <ListItemText primary={title} />
        {open ? <ExpandLess /> : <ExpandMore />}
      </ListItem>

      <Collapse in={open} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          {children}
        </List>
      </Collapse>
    </>
  );
};

const Item: FunctionComponent<{ title: string; icon?: typeof SvgIcon; nested?: boolean; onClick?: () => void }> = ({ title, icon, nested, onClick }) => {
  const classes = useStyles();
  const Icon = icon;

  return (
    <ListItem button onClick={onClick} className={clsx({ [classes.nested]: nested })}>
      {icon && (
        <ListItemIcon>
          <Icon />
        </ListItemIcon>
      )}

      <ListItemText primary={title} />
    </ListItem>
  );
};