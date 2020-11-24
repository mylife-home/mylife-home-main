import React, { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';

import { getRecipesIds } from '../../../store/deploy/selectors';
import { RecipeStepConfig } from '../../../store/deploy/types';
import { SetStepConfig } from './step-editor';

const RecipeStepEditor: FunctionComponent<{ step: RecipeStepConfig; setStep: SetStepConfig }> = ({ step, setStep }) => {
  const handleRecipeChange = (newRecipe: string) => {
    const newStep: RecipeStepConfig = { ...step, recipe: newRecipe };
    setStep(newStep);
  };

  return <RecipeSelector value={step.recipe} onChange={handleRecipeChange} />;
};

export default RecipeStepEditor;

const RecipeSelector: FunctionComponent<{ value: string, onChange: (newValue: string) => void; }> = ({ value, onChange }) => {
  const recipesIds = useSelector(getRecipesIds);

  return (
    <Autocomplete
      value={value}
      onChange={(event: React.ChangeEvent, newValue: string) => onChange(newValue)}
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
