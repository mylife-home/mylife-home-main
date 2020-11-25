import React, { FunctionComponent } from 'react';
import clsx from 'clsx';
import { makeStyles, fade } from '@material-ui/core/styles';
import blue from '@material-ui/core/colors/blue';
import green from '@material-ui/core/colors/green';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Radio from '@material-ui/core/Radio';

import DeleteButton from '../../lib/delete-button';
import { SortableListItem, SortableListMoveHandle } from '../../lib/sortable-list';
import { StepConfig, StepType, RecipeStepConfig, TaskStepConfig } from '../../../store/deploy/types';
import { SetStepConfig } from './step-common';
import RecipeStepEditor from './recipe-step-editor';
import TaskStepEditor from './task-step-editor';

const useStyles = makeStyles((theme) => ({
  card: {
    width: '100%',
    height: 120, // allow several lines of helper text to diplay properly
  },
  container: {
    display: 'flex',
    alignItems: 'baseline',
    '& > *': {
      margin: theme.spacing(0.5),
    },
  },
  taskContainer: {
    backgroundColor: fade(blue[100], 0.2),
  },
  recipeContainer: {
    backgroundColor: fade(green[100], 0.2),
  },
  buttonsContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  moveHandle: {
    margin: theme.spacing(3),
  },
}));

const StepEditor: FunctionComponent<{ step: StepConfig; setStep: SetStepConfig; onDelete: () => void }> = ({ step, setStep, onDelete }) => {
  const classes = useStyles();
  const containerClasses = clsx({
    [classes.container]: true,
    [classes.taskContainer]: step.type === 'task',
    [classes.recipeContainer]: step.type === 'recipe',
  });

  return (
    <SortableListItem useChildAsPreview>
      <Card className={classes.card} square>
        <CardContent className={containerClasses}>
          <div className={classes.buttonsContainer}>
            <SortableListMoveHandle className={classes.moveHandle} />
            <DeleteButton icon tooltip="Supprimer" onConfirmed={onDelete} />
          </div>

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

    switch (newType) {
      case 'task': {
        const newStep: TaskStepConfig = { type: 'task', task: null, parameters: {} };
        setStep(newStep);
        break;
      }

      case 'recipe': {
        const newStep: RecipeStepConfig = { type: 'recipe', recipe: null };
        setStep(newStep);
        break;
      }
    }
  };

  return (
    <RadioGroup value={step.type} onChange={handleChange}>
      <FormControlLabel value="task" control={<Radio size="small" color="primary" />} label="Tâche" />
      <FormControlLabel value="recipe" control={<Radio size="small" color="primary" />} label="Recette" />
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
