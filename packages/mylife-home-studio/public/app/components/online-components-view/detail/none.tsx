import React, { FunctionComponent, createContext, useContext } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import Box from '@material-ui/core/Box';

const None: FunctionComponent = () => {
  return (
    <Box p={3}>
      NONE
    </Box>
  );
};

export default None;
