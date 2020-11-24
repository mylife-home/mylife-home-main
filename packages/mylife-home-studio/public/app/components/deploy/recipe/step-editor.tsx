import React, { FunctionComponent, useCallback, useState } from 'react';
import { useSelector } from 'react-redux';
import clsx from 'clsx';
import { makeStyles, fade } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Radio from '@material-ui/core/Radio';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';

import DeleteButton from '../../lib/delete-button';
import { SortableListItem, SortableListMoveHandle } from '../../lib/sortable-list';
import { RecipeIcon } from '../icons';
import { AppState } from '../../../store/types';
import { getRecipesIds, getTasksIds } from '../../../store/deploy/selectors';
import { StepConfig, StepType, RecipeStepConfig, TaskStepConfig } from '../../../store/deploy/types';

export type SetStepConfig = (value: StepConfig) => void;

const useStyles = makeStyles((theme) => ({
  card: {
    width: '100%',
  },
  // TODO: share with recipe-actions
  deleteButton: {
    color: theme.palette.error.main,
    backgroundColor: 'transparent',
    '&:hover': {
      backgroundColor: fade(theme.palette.text.primary, theme.palette.action.hoverOpacity), // fade = alpha
    },
  },
}));

const StepEditor: FunctionComponent<{ step: StepConfig; setStep: SetStepConfig, onDelete: () => void }> = ({ step, setStep, onDelete }) => {
  const classes = useStyles();
  return (
    <SortableListItem useChildAsPreview>
      <Card className={classes.card} square>
        <CardContent>

          <SortableListMoveHandle />
          <StepTypeSelector step={step} setStep={setStep} />
          <DeleteButton icon tooltip="Supprimer" className={classes.deleteButton} onConfirmed={onDelete} />

          <DetailEditor step={step} setStep={setStep} />
        </CardContent>

      </Card>
    </SortableListItem>
  );
};

export default StepEditor;

const StepTypeSelector: FunctionComponent<{ step: StepConfig; setStep: SetStepConfig }> = ({ step, setStep }) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newType = event.target.value as StepType;

    switch(newType) {
      case 'task': {
        const newStep: TaskStepConfig = { type: 'task', task: null, parameters: {} };
        setStep(newStep);
        break;
      }

      case 'recipe': {
        const newStep: RecipeStepConfig = { type: 'recipe', recipe: null};
        setStep(newStep);
        break;
      }
    }
  };

  return (
    <RadioGroup row value={step.type} onChange={handleChange}>
      <FormControlLabel value="task" control={<Radio size="small" />} label="Tâche" />
      <FormControlLabel value="recipe" control={<Radio size="small" />} label="Recette" />
    </RadioGroup>
  );
};

const DetailEditor: FunctionComponent<{ step: StepConfig; setStep: SetStepConfig }> = ({ step, setStep }) => {
  switch (step.type) {
    case 'task':
      return <TaskStepEditor step={step as TaskStepConfig} setStep={setStep} />;
    case 'recipe':
      return <RecipeStepEditor step={step as RecipeStepConfig} setStep={setStep} />;
  }
};

const TaskStepEditor: FunctionComponent<{ step: TaskStepConfig; setStep: SetStepConfig }> = ({ step, setStep }) => {
  const handleTaskChange = (newTask: string) => {
    const newStep: TaskStepConfig = { ...step, task: newTask, parameters: {} };
    // TODO: init parameters
    setStep(newStep);
  };

  return (
    <>
      <TaskSelector value={step.task} onChange={handleTaskChange} />
      <Typography>{'TaskStepEditor' + JSON.stringify(step)}</Typography>
    </>
  );
};

const TaskSelector: FunctionComponent<{ value: string, onChange: (newValue: string) => void; }> = ({ value, onChange }) => {
  const tasksIds = useSelector(getTasksIds);

  return (
    <Autocomplete
      value={value}
      onChange={(event: any, newValue: string) => onChange(newValue)}
      options={tasksIds}
      renderInput={(params) => (
        <TextField {...params} label="Tâche" />
      )}
    />
  );
};

const RecipeStepEditor: FunctionComponent<{ step: RecipeStepConfig; setStep: SetStepConfig }> = ({ step, setStep }) => {
  const handleRecipeChange = (newRecipe: string) => {
    const newStep: RecipeStepConfig = { ...step, recipe: newRecipe };
    setStep(newStep);
  };

  return <RecipeSelector value={step.recipe} onChange={handleRecipeChange} />;
};

const RecipeSelector: FunctionComponent<{ value: string, onChange: (newValue: string) => void; }> = ({ value, onChange }) => {
  const recipesIds = useSelector(getRecipesIds);

  return (
    <Autocomplete
      value={value}
      onChange={(event: any, newValue: string) => onChange(newValue)}
      selectOnFocus
      clearOnBlur
      handleHomeEndKeys
      options={recipesIds}
      freeSolo
      renderInput={(params) => (
        <TextField {...params} label="Recette" />
      )}
    />
  );
};