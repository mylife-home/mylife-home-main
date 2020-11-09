import React, { FunctionComponent, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { makeStyles, fade } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import AddIcon from '@material-ui/icons/Add';

import DeleteButton from '../lib/delete-button';
import { getRecipesIds, getRecipe } from '../../store/deploy/selectors';
import { clearRecipe, pinRecipe, startRecipe } from '../../store/deploy/actions';
import { AppState } from '../../store/types';
import { RecipeIcon, StartIcon, PinIcon, UnpinIcon } from './icons';
import { useSelection } from './selection';
import { Container, Title } from './layout';

const useStyles = makeStyles((theme) => ({
  newButton: {
    color: theme.palette.success.main,
  },
  list: {
    width: 900,
  },
  deleteButton: {
    color: theme.palette.error.main,
    backgroundColor: 'transparent',
    '&:hover': {
      backgroundColor: fade(theme.palette.text.primary, theme.palette.action.hoverOpacity), // fade = alpha
    },
  },
  startButton: {
    color: theme.palette.success.main,
  },
}));

const Recipes: FunctionComponent = () => {
  const classes = useStyles();
  const recipesIds = useSelector(getRecipesIds);

  return (
    <Container
      title={
        <>
          <Title text="Recettes" icon={RecipeIcon} />

          <Tooltip title="Nouvelle recette">
            <IconButton className={classes.newButton} onClick={() => console.log('TODO new')}>
              <AddIcon />
            </IconButton>
          </Tooltip>
        </>
      }
    >
      <List disablePadding className={classes.list}>
        {recipesIds.map((id) => (
          <RecipeItem key={id} id={id} />
        ))}
      </List>
    </Container>
  );
};

export default Recipes;

const RecipeItem: FunctionComponent<{ id: string }> = ({ id }) => {
  const classes = useStyles();
  const { select } = useSelection();
  const { recipe, clear, pin, start } = useRecipeConnect(id);
  return (
    <ListItem button onClick={() => select({ type: 'recipe', id })}>
      <ListItemIcon>
        <RecipeIcon />
      </ListItemIcon>

      <ListItemText primary={id} secondary={recipe.config.description || null} primaryTypographyProps={{ variant: 'body1' }} secondaryTypographyProps={{ variant: 'body1' }} />

      <ListItemSecondaryAction>
        {recipe.pinned ? (
          <Tooltip title="Désépingler">
            <IconButton onClick={() => pin(false)}>
              <UnpinIcon />
            </IconButton>
          </Tooltip>
        ) : (
          <Tooltip title="Épingler">
            <IconButton onClick={() => pin(true)}>
              <PinIcon />
            </IconButton>
          </Tooltip>
        )}

        <Tooltip title="Démarrer">
          <IconButton className={classes.startButton} onClick={() => start()}>
            <StartIcon />
          </IconButton>
        </Tooltip>

        <DeleteButton icon tooltip="Supprimer" className={classes.deleteButton} onConfirmed={() => clear()} />
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
