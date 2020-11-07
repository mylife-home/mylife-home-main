import React, { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';

import { RecipeIcon } from './icons';
import { useSelection } from './selection';
import { Title } from './layout';

const Recipes: FunctionComponent = () => {
  const { select } = useSelection();

  return (
    <Title text='Recettes' icon={RecipeIcon} />
  );
};

export default Recipes;
