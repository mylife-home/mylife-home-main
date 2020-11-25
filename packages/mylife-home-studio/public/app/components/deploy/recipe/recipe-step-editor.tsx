import React, { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';

import { AppState } from '../../../store/types';
import { getRecipesIds, getRecipe } from '../../../store/deploy/selectors';
import { RecipeStepConfig } from '../../../store/deploy/types';
import { SetStepConfig, useStyles, formatHelperText } from './step-common';

const RecipeStepEditor: FunctionComponent<{ step: RecipeStepConfig; setStep: SetStepConfig }> = ({ step, setStep }) => {
  const handleRecipeChange = (newRecipe: string) => {
    const newStep: RecipeStepConfig = { ...step, recipe: newRecipe };
    setStep(newStep);
  };

  return <RecipeSelector value={step.recipe} onChange={handleRecipeChange} />;
};

export default RecipeStepEditor;

const RecipeSelector: FunctionComponent<{ value: string; onChange: (newValue: string) => void }> = ({ value, onChange }) => {
  const classes = useStyles();
  const recipesIds = useSelector(getRecipesIds);
  const recipe = useSelector((state: AppState) => getRecipe(state, value));
  const helperText = formatHelperText(recipe?.config?.description); // in case recipe is null

  return (
    <Autocomplete
      className={classes.itemWidth}
      value={value}
      onChange={(event: React.ChangeEvent, newValue: string) => onChange(newValue)}
      selectOnFocus
      clearOnBlur
      handleHomeEndKeys
      options={recipesIds}
      freeSolo
      renderInput={(params) => <TextField {...params} label="Recette" helperText={helperText} variant="outlined" className={classes.autoCompleteInput} />}
    />
  );
};
