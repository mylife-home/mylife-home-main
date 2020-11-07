import React, { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';

import { AppState } from '../../store/types';
import { RecipeIcon } from './icons';
import { useSelection } from './selection';
import { Title } from './layout';
import { getRecipe } from '../../store/deploy/selectors';

const Recipe: FunctionComponent<{ id: string; }> = ({ id }) => {
  const { selection } = useSelection();
  const recipe = useSelector((state: AppState) => getRecipe(state, id));

  // TODO: handle recipe that becomes null

  return (
    <Title text={recipe.id} icon={RecipeIcon} />
  );
};

export default Recipe;
