import React, { FunctionComponent, useState } from 'react';
import SvgIcon from '@material-ui/core/SvgIcon';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import Menu from '@material-ui/core/Menu';

export const ToolbarIconButton: FunctionComponent<{ title: string, icon: typeof SvgIcon, onClick: (event: React.MouseEvent<HTMLElement>) => void }> = ({ title, icon, onClick }) => {
  const Icon = icon;
  return (
    <Tooltip title={title}>
      <IconButton onClick={onClick}>
        <Icon /> 
      </IconButton>
    </Tooltip>
  );
};

export const ToolbarMenuIconButton: FunctionComponent<{ title: string, icon: typeof SvgIcon }> = ({ title, icon, children }) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <ToolbarIconButton title={title} icon={icon} onClick={handleClick} />

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
