import React, { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';
import Box from '@material-ui/core/Box';

import { RecipeIcon } from './icons';
import { useSelection } from './selection';
import { Title } from './layout';

const Recipes: FunctionComponent = () => {
  const { select } = useSelection();

  return (
    <Box p={3}>
      <Title text='Recettes' icon={RecipeIcon} />
    </Box>
  );
};

export default Recipes;
