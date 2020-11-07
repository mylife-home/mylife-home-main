import React, { FunctionComponent } from 'react';
import Box from '@material-ui/core/Box';

import { useSelection } from './selection';

const Recipe: FunctionComponent<{ id: string; }> = ({ id }) => {
  const { select } = useSelection();

  return (
    <Box>
      Recipe {id}
    </Box>
  );
};

export default Recipe;
