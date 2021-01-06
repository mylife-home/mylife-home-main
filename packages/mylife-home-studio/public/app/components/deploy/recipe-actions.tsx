import React, { FunctionComponent, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import FileCopyIcon from '@material-ui/icons/FileCopy';

import DeleteButton from '../lib/delete-button';
import { useFireAsync } from '../lib/use-error-handling';
import { useAction } from '../lib/use-actions';
import { useInputDialog } from '../dialogs/input';
import { getRecipesIds, getRecipe } from '../../store/deploy/selectors';
import { clearRecipe, pinRecipe, startRecipe, setRecipe } from '../../store/deploy/actions';
import { AppState } from '../../store/types';
import { StartIcon, PinIcon, UnpinIcon } from './icons';

const useStyles = makeStyles((theme) => ({
  startButton: {
    color: theme.palette.success.main,
  },
}));

const RecipeActions: FunctionComponent<{ id: string }> = ({ id }) => {
  const classes = useStyles();
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
    <>
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

      <DeleteButton icon tooltip="Supprimer" onConfirmed={() => clear()} />
    </>
  );
};

export default RecipeActions;

function useRecipeConnect(id: string) {
  const dispatch = useDispatch();
  return {
    recipe: useSelector((state: AppState) => getRecipe(state, id)),
    setRecipe: useAction(setRecipe),
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

export function useNewNameDialog() {
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
