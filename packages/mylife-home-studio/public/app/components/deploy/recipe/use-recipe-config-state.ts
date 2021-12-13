import React, { useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { useDebounced } from '../../lib/use-debounced';
import { AppState } from '../../../store/types';
import { setRecipe } from '../../../store/deploy/actions';
import { getRecipe } from '../../../store/deploy/selectors';
import { RecipeConfig, StepConfig, TaskStepConfig } from '../../../store/deploy/types';

export type SetRecipeConfig = React.Dispatch<React.SetStateAction<RecipeConfig>>;

export function useRecipeConfigState(id: string): [RecipeConfig, SetRecipeConfig] {
  const recipe = useSelector((state: AppState) => getRecipe(state, id));
  const dispatch = useDispatch();
  const persistRecipeConfig = useCallback(
    (config: RecipeConfig) => {
      dispatch(setRecipe({ id, config }));
    },
    [dispatch, id]
  );

  const { componentValue, componentChange } = useDebounced(recipe.config, persistRecipeConfig);
  return [componentValue, componentChange];
}

export function useStepOperations(setConfig: SetRecipeConfig) {
  const newStep = useCallback(() => setConfig((config) => {
    const newStep: TaskStepConfig = { type: 'task', enabled: true, note: '', task: null, parameters: {} };
    const newSteps = [...config.steps, newStep];
    return { ...config, steps: newSteps };
  }), [setConfig]);

  const moveStep = useCallback(
    (from: number, to: number) =>
      setConfig((config) => {
        const movedStep = config.steps[from];
        const newSteps = [...config.steps];
        newSteps.splice(from, 1);
        newSteps.splice(to, 0, movedStep);

        return { ...config, steps: newSteps };
      }),
    [setConfig]
  );

  const deleteStep = useCallback((index: number) => setConfig((config) => {
    const newSteps = [...config.steps];
    newSteps.splice(index, 1);

    return { ...config, steps: newSteps };
  }), [setConfig]);

  const setStep = useCallback((index: number, newStep: StepConfig) => setConfig((config) => {
    const newSteps = [...config.steps];
    newSteps[index] = newStep;
    return { ...config, steps: newSteps };
  }), [setConfig]);

  return { newStep, moveStep, deleteStep, setStep };
}
