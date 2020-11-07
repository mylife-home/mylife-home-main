import React, { FunctionComponent } from 'react';
import Box from '@material-ui/core/Box';

import { useSelection } from './selection';

const Runs: FunctionComponent = () => {
  const { select } = useSelection();

  return (
    <Box>
      Runs
    </Box>
  );
};

export default Runs;
