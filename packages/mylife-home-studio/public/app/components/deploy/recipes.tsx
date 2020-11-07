import React, { FunctionComponent } from 'react';
import Box from '@material-ui/core/Box';

import { useSelection } from './selection';

const Recipes: FunctionComponent = () => {
  const { select } = useSelection();

  return (
    <Box>
      Recipes
    </Box>
  );
};

export default Recipes;
