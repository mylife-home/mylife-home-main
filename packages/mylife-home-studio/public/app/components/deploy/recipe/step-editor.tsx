import React, { FunctionComponent } from 'react';
import { makeStyles, fade } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Radio from '@material-ui/core/Radio';

import DeleteButton from '../../lib/delete-button';
import { SortableListItem, SortableListMoveHandle } from '../../lib/sortable-list';
import { StepConfig, StepType, RecipeStepConfig, TaskStepConfig } from '../../../store/deploy/types';
import RecipeStepEditor from './recipe-step-editor';
import TaskStepEditor from './task-step-editor';

export type SetStepConfig = (value: StepConfig) => void;

export const useStyles = makeStyles((theme) => ({
  card: {
    width: '100%',
  },
  container: {
    display: 'flex',
    alignItems: 'baseline',
    '& > *': {
      margin: theme.spacing(0.5),
    },
  },
  itemWidth: {
    width: 200
  },
  // try to remove this pate when Autocomplete is more stable
  autoCompleteInput: {
    marginTop: -6,
    marginBottom: 0
  }
}));

const StepEditor: FunctionComponent<{ step: StepConfig; setStep: SetStepConfig, onDelete: () => void }> = ({ step, setStep, onDelete }) => {
  const classes = useStyles();
  return (
    <SortableListItem useChildAsPreview>
      <Card className={classes.card} square>
        <CardContent className={classes.container}>

          <SortableListMoveHandle />
          <DeleteButton icon tooltip="Supprimer" onConfirmed={onDelete} />
          <StepTypeSelector step={step} setStep={setStep} />

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
