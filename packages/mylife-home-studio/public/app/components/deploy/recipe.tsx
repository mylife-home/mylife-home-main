import React, { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';

import { AppState } from '../../store/types';
import { RecipeIcon } from './icons';
import { useResetSelectionIfNull } from './selection';
import { Title } from './layout';
import { getRecipe } from '../../store/deploy/selectors';

const Recipe: FunctionComponent<{ id: string; }> = ({ id }) => {
  const recipe = useSelector((state: AppState) => getRecipe(state, id));

  // handle recipe that becomes null (after deletion)
  useResetSelectionIfNull(recipe);

  if (!recipe) {
    return null;
  }

  return (
    <Title text={recipe.id} icon={RecipeIcon} />
  );
};

export default Recipe;
