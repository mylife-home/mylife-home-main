import React, { FunctionComponent, ReactNode, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import SvgIcon from '@material-ui/core/SvgIcon';
import Badge from '@material-ui/core/Badge';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import Menu from '@material-ui/core/Menu';

const useStyles = makeStyles((theme) => ({
  badgeIcon: {
    background: null,
    color: theme.palette.primary.main,
  },
}));

interface ToolbarIconButtonProps {
  title: ReactNode;
  icon: ReactNode;
  onClick: (event: React.MouseEvent<HTMLElement>) => void;
}

export const ToolbarIconButton: FunctionComponent<ToolbarIconButtonProps> = ({ title, icon, onClick }) => {
  return (
    <Tooltip title={title}>
      <IconButton onClick={onClick}>
        {icon}
      </IconButton>
    </Tooltip>
  );
};

type ToolbarMenuIconButtonProps = Omit<ToolbarIconButtonProps, 'onClick'>;

export const ToolbarMenuIconButton: FunctionComponent<ToolbarMenuIconButtonProps> = ({ children, ...props }) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <ToolbarIconButton {...props} onClick={handleClick} />

      <Menu
        getContentAnchorEl={null}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        keepMounted
        anchorEl={anchorEl}
        open={!!anchorEl}
        onClose={handleClose}
        onClick={handleClose}
      >
        {children}
      </Menu>
    </>
  );
};

export const IconWithBadge: FunctionComponent<{ main: ReactNode, badge: ReactNode }> = ({ main, badge }) => {
  const classes = useStyles();

  return (
    <Badge badgeContent={badge} classes={{badge: classes.badgeIcon}}>
      {main}
    </Badge>
  );
};
