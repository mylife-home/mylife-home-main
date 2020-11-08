import React, { FunctionComponent, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import Divider from '@material-ui/core/Divider';

import { getRecipesIds, getRecipe } from '../../store/deploy/selectors';
import { clearRecipe, pinRecipe, startRecipe } from '../../store/deploy/actions';
import { AppState } from '../../store/types';
import { RecipeIcon, StartIcon, DeleteIcon, PinIcon, UnpinIcon } from './icons';
import { useSelection } from './selection';
import { Title } from './layout';

const useStyles = makeStyles((theme) => ({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,

    display: 'flex',
    flexDirection: 'column',
  },
  title: {
    margin: theme.spacing(3),
  },
  listWrapper: {
    flex: '1 1 auto',
    overflowY: 'auto',
  },
  list: {
    width: 650,
  },
}));

const Recipes: FunctionComponent = () => {
  const classes = useStyles();
  const recipesIds = useSelector(getRecipesIds);

  return (
    <div className={classes.container}>
      <Title className={classes.title} text="Recettes" icon={RecipeIcon} />

      <Divider />

      <div className={classes.listWrapper}>
        <List disablePadding className={classes.list}>
          {recipesIds.map((id) => (
            <RecipeItem key={id} id={id} />
          ))}
        </List>
      </div>
    </div>
  );
};

export default Recipes;

const RecipeItem: FunctionComponent<{ id: string }> = ({ id }) => {
  const { select } = useSelection();
  const { recipe, clear, pin, start } = useRecipeConnect(id);
  return (
    <ListItem button onClick={() => select({ type: 'recipe', id })}>
      <ListItemIcon>
        <RecipeIcon />
      </ListItemIcon>

      <ListItemText primary={id} secondary={recipe.config.description || null} />

      <ListItemSecondaryAction>
        {recipe.pinned ? (
          <Tooltip title="Désépingler">
            <IconButton edge="end" onClick={() => pin(false)}>
              <UnpinIcon />
            </IconButton>
          </Tooltip>
        ) : (
          <Tooltip title="Épingler" onClick={() => pin(true)}>
            <IconButton edge="end">
              <PinIcon />
            </IconButton>
          </Tooltip>
        )}

        <Tooltip title="Démarrer" onClick={() => start()}>
          <IconButton edge="end">
            <StartIcon />
          </IconButton>
        </Tooltip>

        <Tooltip title="Supprimer" onClick={() => console.log('TODO')}>
          <IconButton edge="end">
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      </ListItemSecondaryAction>
    </ListItem>
  );
};

function useRecipeConnect(id: string) {
  const dispatch = useDispatch();
  return {
    recipe: useSelector((state: AppState) => getRecipe(state, id)),
    ...useMemo(
      () => ({
        clear: () => dispatch(clearRecipe(id)),
        pin: (value: boolean) => dispatch(pinRecipe({ id, value })),
        start: () => dispatch(startRecipe(id)),
      }),
      [dispatch, id]
    ),
  };
}
