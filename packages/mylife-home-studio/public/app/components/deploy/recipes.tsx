import React, { FunctionComponent, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { makeStyles, fade } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import AddIcon from '@material-ui/icons/Add';
import FileCopyIcon from '@material-ui/icons/FileCopy';

import DeleteButton from '../lib/delete-button';
import { useFireAsync } from '../lib/use-error-handling';
import { useActions } from '../lib/use-actions';
import { useInputDialog } from '../dialogs/input';
import { getRecipesIds, getRecipe } from '../../store/deploy/selectors';
import { clearRecipe, pinRecipe, startRecipe, setRecipe } from '../../store/deploy/actions';
import { RecipeConfig } from '../../store/deploy/types';
import { AppState } from '../../store/types';
import { RecipeIcon, StartIcon, PinIcon, UnpinIcon } from './icons';
import { useSelection } from './selection';
import { Container, Title, CustomizedListItemText } from './layout';

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

const EMPTY_RECIPE_CONFIG: RecipeConfig = {
  description: '',
  steps: [],
};

const Recipes: FunctionComponent = () => {
  const classes = useStyles();
  const { recipesIds, setRecipe } = useRecipesConnect();
  const fireAsync = useFireAsync();
  const showNewNameDialog = useNewNameDialog();

  const onNew = () =>
    fireAsync(async () => {
      const { status, id } = await showNewNameDialog();
      if (status === 'ok') {
        setRecipe({ id, config: EMPTY_RECIPE_CONFIG });
      }
    });

    return (
    <Container
      title={
        <>
          <Title text="Recettes" icon={RecipeIcon} />

          <Tooltip title="Nouvelle recette">
            <IconButton className={classes.newButton} onClick={onNew}>
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
  const { recipe, clear, pin, start, setRecipe } = useRecipeConnect(id);
  const fireAsync = useFireAsync();
  const showNewNameDialog = useNewNameDialog();

  const onDuplicate = () =>
    fireAsync(async () => {
      const { status, id } = await showNewNameDialog();
      if (status === 'ok') {
        const config = clone(recipe.config);
        setRecipe({ id, config });
      }
    });

  return (
    <ListItem button onClick={() => select({ type: 'recipe', id })}>
      <ListItemIcon>
        <RecipeIcon />
      </ListItemIcon>

      <CustomizedListItemText primary={id} secondary={recipe.config.description || null} />

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

        <Tooltip title="Dupliquer">
          <IconButton onClick={onDuplicate}>
            <FileCopyIcon />
          </IconButton>
        </Tooltip>

        <DeleteButton icon tooltip="Supprimer" className={classes.deleteButton} onConfirmed={() => clear()} />
      </ListItemSecondaryAction>
    </ListItem>
  );
};

function useRecipesConnect() {
  return {
    recipesIds: useSelector(getRecipesIds),
    ...useActions({ setRecipe })
  };
}

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
    ...useActions({ setRecipe }),
  };
}

function useNewNameDialog() {
  const showDialog = useInputDialog();
  const recipesIds = useSelector(getRecipesIds);

  const options = {
    title: 'Nouveau nom',
    message: 'Entrer un nom de recette',
    initialText: 'Nouvelle recette',
    validator(newId: string) {
      if (!newId) {
        return 'Nom vide';
      }
      if (recipesIds.includes(newId)) {
        return 'Ce nom existe déjà';
      }
    }
  };

  return async () => {
    const { status, text: id } = await showDialog(options);
    return { status, id };
  };
}

function clone<T>(obj: T) {
  return JSON.parse(JSON.stringify(obj)) as T;
}
