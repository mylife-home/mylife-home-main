import React, { FunctionComponent } from 'react';
import Box from '@material-ui/core/Box';

import { useSelection } from './selection';

const Files: FunctionComponent = () => {
  const { select } = useSelection();

  return (
    <Box>
      Files
    </Box>
  );
};

export default Files;
