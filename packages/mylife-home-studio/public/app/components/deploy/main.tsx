import React, { FunctionComponent } from 'react';
import Box from '@material-ui/core/Box';

import { useSelection } from './selection';

const Main: FunctionComponent = () => {
  const { selection } = useSelection();

  return (
    <Box>
      {JSON.stringify(selection || null)}
    </Box>
  );
};

export default Main;
