import React, { FunctionComponent, useCallback, useState } from 'react';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Radio from '@material-ui/core/Radio';

import { SortableListItem, SortableListMoveHandle } from '../../lib/sortable-list';
import { RecipeIcon } from '../icons';
import { AppState } from '../../../store/types';
import { StepConfig, StepType } from '../../../store/deploy/types';

export type SetStepConfig = (value: StepConfig) => void;

const StepEditor: FunctionComponent<{ step: StepConfig; setStep: SetStepConfig }> = ({ step, setStep }) => {
  return (
    <SortableListItem useChildAsPreview>
      <Card style={{ width: '100%' }} square>
        <CardContent>
          <SortableListMoveHandle />

          <StepTypeSelector step={step} setStep={setStep} />

          <Typography>{JSON.stringify(step)}</Typography>
        </CardContent>
      </Card>
    </SortableListItem>
  );
};

export default StepEditor;

const StepTypeSelector: FunctionComponent<{ step: StepConfig; setStep: SetStepConfig }> = ({ step, setStep }) => {
  const [value, setValue] = useState<StepType>('recipe');

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value as StepType);
  };

  return (
    <RadioGroup row value={value} onChange={handleChange}>
      <FormControlLabel value="task" control={<Radio size="small" />} label="Tâche" />
      <FormControlLabel value="recipe" control={<Radio size="small" />} label="Recette" />
    </RadioGroup>
  );
};
