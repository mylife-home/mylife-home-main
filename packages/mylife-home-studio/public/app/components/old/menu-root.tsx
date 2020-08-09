import React, { FunctionComponent, useState, SyntheticEvent } from 'react';

import Button, { ButtonProps } from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';

interface MenuItemData {
  readonly title: string;
  readonly handler: () => void;
}

type MenuRootProps = ButtonProps & { readonly menuId: string, readonly title: string, readonly items: MenuItemData[] };

const MenuRoot: FunctionComponent<MenuRootProps> = ({ menuId, title, items, ...props }) => {

  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event: SyntheticEvent) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div>
      <Button aria-controls={menuId} aria-haspopup="menu" onClick={handleClick} {...props}>
        {title}
      </Button>
      <Menu
        id={menuId}
        anchorEl={anchorEl}
        getContentAnchorEl={null}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        open={!!anchorEl}
        onClose={handleClose}
      >
        {items.map(({ title, handler }, index) => (
          <MenuItem key={index} onClick={() => { handleClose(); handler(); }}>{title}</MenuItem>
        ))}
      </Menu>
    </div>
  );
};

export default MenuRoot;