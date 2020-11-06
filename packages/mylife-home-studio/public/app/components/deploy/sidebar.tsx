import React, { FunctionComponent } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import Divider from '@material-ui/core/Divider';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import IconButton from '@material-ui/core/IconButton';

import { RecipeIcon, StartIcon, RunsIcon, FileIcon } from './icons';

const useStyles = makeStyles((theme) => ({
  section: {},
  item: {
    paddingLeft: theme.spacing(8),
  },
  divider: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
}));

const SideBar: FunctionComponent = () => {
  const classes = useStyles();
  return (
    <List>
      <ListItem button>
        <ListItemIcon>
          <RecipeIcon />
        </ListItemIcon>
        <ListItemText primary="Recettes" primaryTypographyProps={{ variant: 'h6' }} />
      </ListItem>
      <ListItem button className={classes.item}>
        <ListItemIcon>
          <RecipeIcon />
        </ListItemIcon>
        <ListItemText primary="Recette 1" primaryTypographyProps={{ variant: 'body1' }} />
        <ListItemSecondaryAction>
          <IconButton edge="end" aria-label="Démarrer">
            <StartIcon />
          </IconButton>
        </ListItemSecondaryAction>
      </ListItem>
      <ListItem button className={classes.item}>
        <ListItemIcon>
          <RecipeIcon />
        </ListItemIcon>
        <ListItemText primary="Recette 2" primaryTypographyProps={{ variant: 'body1' }} />
      </ListItem>
      <ListItem button className={classes.item}>
        <ListItemIcon>
          <RecipeIcon />
        </ListItemIcon>
        <ListItemText primary="Recette 3" primaryTypographyProps={{ variant: 'body1' }} />
      </ListItem>

      <Divider className={classes.divider} />

      <ListItem button>
        <ListItemIcon>
          <RunsIcon />
        </ListItemIcon>
        <ListItemText primary="Executions" primaryTypographyProps={{ variant: 'h6' }} />
      </ListItem>

      <Divider className={classes.divider} />

      <ListItem button>
        <ListItemIcon>
          <FileIcon />
        </ListItemIcon>
        <ListItemText primary="Fichiers" primaryTypographyProps={{ variant: 'h6' }} />
      </ListItem>
    </List>
  );
};

export default SideBar;
