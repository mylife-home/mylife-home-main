import React, { FunctionComponent } from 'react';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import SvgIcon from '@material-ui/core/SvgIcon';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Collapse from '@material-ui/core/Collapse';
import InboxIcon from '@material-ui/icons/MoveToInbox';
import DraftsIcon from '@material-ui/icons/Drafts';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';

import { ProjectIcon, WindowIcon, ImageIcon, ComponentIcon } from '../lib/icons';

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
  },
  nested: {
    paddingLeft: theme.spacing(8),
  },
}));

const ObjectList: FunctionComponent = () => {
  const classes = useStyles();
  const [open, setOpen] = React.useState(true);

  const handleClick = () => {
    setOpen(!open);
  };

  return (
    <List component="nav" className={classes.root}>
      <Item title="Projet" icon={ProjectIcon} />

      <Group title="Ressources" icon={ImageIcon}>
        <Item title="res1" nested />
      </Group>

      <Group title="Fenêtres" icon={WindowIcon}>
        <Item title="window1" nested />
      </Group>


      <Group title="Composants" icon={ComponentIcon}>
        <Item title="compo1" nested />
      </Group>
    </List>
  );
};

export default ObjectList;

const Group: FunctionComponent<{ title: string; icon: typeof SvgIcon }> = ({ title, icon, children }) => {
  const Icon = icon;

  const [open, setOpen] = React.useState(true);

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
