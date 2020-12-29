import React, { FunctionComponent } from 'react';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import SvgIcon from '@material-ui/core/SvgIcon';
import List from '@material-ui/core/List';
import Divider from '@material-ui/core/Divider';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';

const useStyles = makeStyles((theme) => ({
  list: {
    overflowY: 'auto',
    height: '100%',
  },
  section: {},
  item: {
    paddingLeft: theme.spacing(8),
  },
  divider: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
}));

export interface BaseItemProps {
  title: string;
  icon: typeof SvgIcon;
  onClick: () => void;
}

export interface SectionProps extends BaseItemProps {}

export interface ItemProps extends BaseItemProps {
  secondary?: {
    tooltip: string;
    icon: typeof SvgIcon;
    onClick: () => void;
  };
}

export const SideBarList: FunctionComponent<{ className?: string }> = ({ className, children }) => {
  const classes = useStyles();
  return <List className={clsx(classes.list, className)}>{children}</List>;
};

export const SideBarDivider: FunctionComponent = () => {
  const classes = useStyles();
  return <Divider className={classes.divider} />;
};

export const Section: FunctionComponent<SectionProps> = ({ title, icon, onClick }) => {
  const classes = useStyles();
  const Icon = icon;

  return (
    <ListItem button className={classes.section} onClick={onClick}>
      <ListItemIcon>
        <Icon />
      </ListItemIcon>
      <ListItemText primary={title} primaryTypographyProps={{ variant: 'h6' }} />
    </ListItem>
  );
};

export const Item: FunctionComponent<ItemProps> = ({ title, icon, onClick, secondary }) => {
  const classes = useStyles();
  const Icon = icon;
  const SecondaryIcon = secondary?.icon;

  return (
    <ListItem button className={classes.item} onClick={onClick}>
      <ListItemIcon>
        <Icon />
      </ListItemIcon>
      <ListItemText primary={title} />
      {secondary && (
        <ListItemSecondaryAction>
          <Tooltip title={secondary.tooltip}>
            <IconButton edge="end" onClick={secondary.onClick}>
              <SecondaryIcon />
            </IconButton>
          </Tooltip>
        </ListItemSecondaryAction>
      )}
    </ListItem>
  );
};
