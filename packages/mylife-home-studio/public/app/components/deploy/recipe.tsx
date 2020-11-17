import React, { FunctionComponent, useState, useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';

import DebouncedTextField from '../lib/debounced-text-field';
import { useDebounced } from '../lib/use-debounced';
import { useResetSelectionIfNull } from './selection';
import { RecipeIcon } from './icons';
import { Container, Title } from './layout';
import RecipeActions from './recipe-actions';
import { AppState } from '../../store/types';
import { setRecipe } from '../../store/deploy/actions';
import { getRecipe } from '../../store/deploy/selectors';
import { RecipeConfig } from '../../../../shared/deploy';

const Recipe: FunctionComponent<{ id: string }> = ({ id }) => {
  const recipe = useSelector((state: AppState) => getRecipe(state, id));

  // handle recipe that becomes null (after deletion)
  useResetSelectionIfNull(recipe);

  if (!recipe) {
    return null;
  }

  return (
    <RecipePanel id={id} />
  );
};

export default Recipe;

const useStyles = makeStyles((theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  header: {},
  config: {
    flex: 1,
  },
}));

type SetRecipeConfig = React.Dispatch<React.SetStateAction<RecipeConfig>>;

const RecipePanel: FunctionComponent<{ id: string }> = ({ id }) => {
  const classes = useStyles();
  const [config, setConfig] = useRecipeConfigState(id);

  return (
    <Container title={<Title text={id} icon={RecipeIcon} />}>
      <div className={classes.container}>
        <HeaderPanel id={id} config={config} setConfig={setConfig} className={classes.header} />
        <Divider />
        <ConfigPanel config={config} setConfig={setConfig} className={classes.config} />
      </div>
    </Container>
  );
};

const useHeaderPanelStyles = makeStyles((theme) => ({
  container: {
    width: 900,
    margin: theme.spacing(3),
  },
}));

const HeaderPanel: FunctionComponent<{ className?: string; id: string; config: RecipeConfig, setConfig: SetRecipeConfig }> = ({ className, id, config, setConfig }) => {
  const classes = useHeaderPanelStyles();

  const updateDescription = useCallback((description: string) => {
    setConfig(config => ({ ...config, description }));
  }, [setConfig]);

  return (
    <Grid container spacing={3} className={clsx(classes.container, className)}>
      <Grid item xs={12}>
        <DebouncedTextField label="Description" fullWidth value={config.description} onChange={updateDescription} />
      </Grid>

      <Grid item xs={12}>
        <RecipeActions id={id} />
      </Grid>
    </Grid>
  );
};

const ConfigPanel: FunctionComponent<{ className?: string; config: RecipeConfig, setConfig: SetRecipeConfig }> = ({ className, config, setConfig }) => {
  return (
    <Typography>
      TODO
    </Typography>
  );
};

function useRecipeConfigState(id: string): [RecipeConfig, SetRecipeConfig] {
  const recipe = useSelector((state: AppState) => getRecipe(state, id));
  const dispatch = useDispatch();
  const persistRecipeConfig = useCallback((config: RecipeConfig) => { dispatch(setRecipe({ id, config })) }, [dispatch]);
  const { componentValue, componentChange } = useDebounced(recipe.config, persistRecipeConfig);
  return [componentValue, componentChange];
}
