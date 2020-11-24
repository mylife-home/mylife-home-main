import React, { FunctionComponent, useCallback } from 'react';
import { useSelector } from 'react-redux';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Divider from '@material-ui/core/Divider';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import AddIcon from '@material-ui/icons/Add';

import DebouncedTextField from '../../lib/debounced-text-field';
import { SortableList } from '../../lib/sortable-list';
import { useResetSelectionIfNull } from '../selection';
import { RecipeIcon } from '../icons';
import { Container, Title } from '../layout';
import RecipeActions from '../recipe-actions';
import StepEditor, { SetStepConfig } from './step-editor';
import { AppState } from '../../../store/types';
import { getRecipe } from '../../../store/deploy/selectors';
import { useRecipeConfigState, useStepOperations, RecipeConfigWithIds, SetRecipeConfig } from './use-recipe-config-state';

const Recipe: FunctionComponent<{ id: string }> = ({ id }) => {
  const recipe = useSelector((state: AppState) => getRecipe(state, id));

  // handle recipe that becomes null (after deletion)
  useResetSelectionIfNull(recipe);

  if (!recipe) {
    return null;
  }

  return <RecipePanel id={id} />;
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
    width: '100%',
    margin: theme.spacing(3),
  },
}));

const HeaderPanel: FunctionComponent<{ className?: string; id: string; config: RecipeConfigWithIds; setConfig: SetRecipeConfig }> = ({ className, id, config, setConfig }) => {
  const classes = useHeaderPanelStyles();

  const updateDescription = useCallback(
    (description: string) => {
      setConfig((config) => ({ ...config, description }));
    },
    [setConfig]
  );

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

const useConfigPanelStyles = makeStyles((theme) => ({
  list: {
    width: '100%',
  },
}));

const ConfigPanel: FunctionComponent<{ className?: string; config: RecipeConfigWithIds; setConfig: SetRecipeConfig }> = ({ className, config, setConfig }) => {
  const classes = useConfigPanelStyles();
  const { moveStep, deleteStep, setStep } = useStepOperations(setConfig);

  return (
    <SortableList disablePadding className={clsx(className, classes.list)} moveItem={moveStep}>
      {config.steps.map((step, index) => {
        const onSetStep: SetStepConfig = (newStep) => setStep(index, newStep);
        const onDelete = () => deleteStep(index);
        const key = config.stepIds[index];

        return <StepEditor key={key} step={step} setStep={onSetStep} onDelete={onDelete} />;
      })}

      <AddStepItem setConfig={setConfig} />
    </SortableList>
  );
};

const useAddStepItemStyles = makeStyles((theme) => ({
  newButton: {
    color: theme.palette.success.main,
  },
}));

const AddStepItem: FunctionComponent<{ setConfig: SetRecipeConfig }> = ({ setConfig }) => {
  const classes = useAddStepItemStyles();
  const { newStep } = useStepOperations(setConfig);

  return (
    <ListItem>
      <ListItemIcon>
        <Tooltip title="Nouvelle étape">
          <IconButton className={classes.newButton} onClick={newStep}>
            <AddIcon />
          </IconButton>
        </Tooltip>
      </ListItemIcon>
    </ListItem>
  );
};
