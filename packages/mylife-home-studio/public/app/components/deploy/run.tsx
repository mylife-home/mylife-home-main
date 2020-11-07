import React, { FunctionComponent } from 'react';
import Box from '@material-ui/core/Box';

import { useSelection } from './selection';

const Run: FunctionComponent<{ id: string; }> = ({ id }) => {
  const { select } = useSelection();

  return (
    <Box>
      Run {id}
    </Box>
  );
};

export default Run;
