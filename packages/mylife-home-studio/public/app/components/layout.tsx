import React, { FunctionComponent } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';

import MenuRoot from './menu-root';

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
}));

const Layout: FunctionComponent = () => {
  const classes = useStyles();

  return (
    <div className={classes.root}>

      <AppBar position='static'>
        <Toolbar>
          <MenuRoot color="inherit" menuId="simple-menu" title="Fichier" items={[
            { title: 'Nouveau', handler: () => console.log('new') },
            { title: 'Ouvrir', handler: () => console.log('open') },
          ]} />
        </Toolbar>
      </AppBar>

    </div>
  );
};

export default Layout;
