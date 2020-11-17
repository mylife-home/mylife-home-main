import React, { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import AddIcon from '@material-ui/icons/Add';

import { useFireAsync } from '../lib/use-error-handling';
import { useActions } from '../lib/use-actions';
import { getRecipesIds, getRecipe } from '../../store/deploy/selectors';
import { setRecipe } from '../../store/deploy/actions';
import { RecipeConfig } from '../../store/deploy/types';
import { AppState } from '../../store/types';
import { RecipeIcon } from './icons';
import { useSelection } from './selection';
import { Container, Title, CustomizedListItemText } from './layout';
import RecipeActions, { useNewNameDialog } from './recipe-actions';

const useStyles = makeStyles((theme) => ({
  newButton: {
    color: theme.palette.success.main,
  },
  list: {
    width: 900,
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
  const { select } = useSelection();
  const recipe = useSelector((state: AppState) => getRecipe(state, id));

  return (
    <ListItem button onClick={() => select({ type: 'recipe', id })}>
      <ListItemIcon>
        <RecipeIcon />
      </ListItemIcon>

      <CustomizedListItemText primary={id} secondary={recipe.config.description || null} />

      <ListItemSecondaryAction>
        <RecipeActions id={id} />
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
