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
import Divider from '@material-ui/core/Divider';
import AddIcon from '@material-ui/icons/Add';

import DeleteButton from '../lib/delete-button';
import { getRecipesIds, getRecipe } from '../../store/deploy/selectors';
import { clearRecipe, pinRecipe, startRecipe } from '../../store/deploy/actions';
import { AppState } from '../../store/types';
import { RecipeIcon, StartIcon, PinIcon, UnpinIcon } from './icons';
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
  titleContainer: {
    display: 'flex',
    flexDirection: 'row',
    //justifyContent: 'space-between',
    alignItems: 'baseline',
    margin: theme.spacing(3),
    width: 650,

    '& > *': {
      marginRight: theme.spacing(8),
    },
  },
  newButton: {
    color: theme.palette.success.main,
  },
  listWrapper: {
    flex: '1 1 auto',
    overflowY: 'auto',
  },
  list: {
    width: 650,
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
    <div className={classes.container}>
      <div className={classes.titleContainer}>
        <Title text="Recettes" icon={RecipeIcon} />

        <Tooltip title="Nouvelle recette">
          <IconButton className={classes.newButton} onClick={() => console.log('TODO new')}>
            <AddIcon />
          </IconButton>
        </Tooltip>
      </div>

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
