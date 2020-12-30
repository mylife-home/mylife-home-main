import React, { useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { useDebounced } from '../../lib/use-debounced';
import { AppState } from '../../../store/types';
import { setRecipe } from '../../../store/deploy/actions';
import { getRecipe } from '../../../store/deploy/selectors';
import { RecipeConfig, StepConfig, TaskStepConfig } from '../../../store/deploy/types';

export interface RecipeConfigWithIds extends RecipeConfig {
  stepIds: number[];
}

export type SetRecipeConfig = React.Dispatch<React.SetStateAction<RecipeConfigWithIds>>;

export function useRecipeConfigState(id: string): [RecipeConfigWithIds, SetRecipeConfig] {
  const recipe = useSelector((state: AppState) => getRecipe(state, id));
  const dispatch = useDispatch();
  const persistRecipeConfig = useCallback(
    (config: RecipeConfigWithIds) => {
      dispatch(setRecipe({ id, config: withoutIds(config) }));
    },
    [dispatch]
  );

  const config = useMemo(() => withIds(recipe.config), [recipe.config]);

  const { componentValue, componentChange } = useDebounced(config, persistRecipeConfig);
  return [componentValue, componentChange];
}

function withIds(config: RecipeConfig) {
  const finalConfig: RecipeConfigWithIds = { stepIds: [], ...config };
  for (const step of config.steps) {
    finalConfig.stepIds.push(newId());
  }
  return finalConfig;
}

function withoutIds(config: RecipeConfigWithIds): RecipeConfig {
  const { stepIds, ...trimmedConfig } = config;
  return trimmedConfig;
}

let idGenerator: number = 0;

function newId() {
  return ++idGenerator;
}

export function useStepOperations(setConfig: SetRecipeConfig) {
  const newStep = useCallback(() => setConfig((config) => {
    const newStep: TaskStepConfig = { type: 'task', task: null, parameters: {} };
    const newSteps = [...config.steps, newStep];
    const newStepIds = [...config.stepIds, newId()];
    return { ...config, steps: newSteps, stepIds: newStepIds };
  }), [setConfig]);

  const moveStep = useCallback(
    (from: number, to: number) =>
      setConfig((config) => {
        const movedStep = config.steps[from];
        const newSteps = [...config.steps];
        newSteps.splice(from, 1);
        newSteps.splice(to, 0, movedStep);

        const movedStepId = config.stepIds[from];
        const newStepIds = [...config.stepIds];
        newStepIds.splice(from, 1);
        newStepIds.splice(to, 0, movedStepId);

        return { ...config, steps: newSteps, stepIds: newStepIds };
      }),
    [setConfig]
  );

  const deleteStep = useCallback((index: number) => setConfig((config) => {
    const newSteps = [...config.steps];
    newSteps.splice(index, 1);

    const newStepIds = [...config.stepIds];
    newStepIds.splice(index, 1);

    return { ...config, steps: newSteps, stepIds: newStepIds };
  }), [setConfig]);

  const setStep = useCallback((index: number, newStep: StepConfig) => setConfig((config) => {
    const newSteps = [...config.steps];
    newSteps[index] = newStep;
    return { ...config, steps: newSteps };
  }), [setConfig]);

  return { newStep, moveStep, deleteStep, setStep };
}
