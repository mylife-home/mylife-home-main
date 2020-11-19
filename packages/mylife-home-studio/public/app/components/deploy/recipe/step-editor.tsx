import React, { FunctionComponent, useCallback, useState } from 'react';
import clsx from 'clsx';
import { makeStyles, fade } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Radio from '@material-ui/core/Radio';

import DeleteButton from '../../lib/delete-button';
import { SortableListItem, SortableListMoveHandle } from '../../lib/sortable-list';
import { RecipeIcon } from '../icons';
import { AppState } from '../../../store/types';
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


const StepEditor: FunctionComponent<{ step: StepConfig; setStep: SetStepConfig }> = ({ step, setStep }) => {
  const classes = useStyles();
  return (
    <SortableListItem useChildAsPreview>
      <Card className={classes.card} square>
        <CardContent>

          <SortableListMoveHandle />
          <StepTypeSelector step={step} setStep={setStep} />
          <DeleteButton icon tooltip="Supprimer" className={classes.deleteButton} onConfirmed={() => console.log('TODO delete')} />

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
    // TODO: reset stuff + call setStep
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
  return <Typography>{'TaskStepEditor' + JSON.stringify(step)}</Typography>;
};

const RecipeStepEditor: FunctionComponent<{ step: RecipeStepConfig; setStep: SetStepConfig }> = ({ step, setStep }) => {
  return <Typography>{'RecipeStepEditor' + JSON.stringify(step)}</Typography>;
};
