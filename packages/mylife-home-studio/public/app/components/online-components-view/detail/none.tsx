import React, { FunctionComponent, createContext, useContext } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import Box from '@material-ui/core/Box';
import { Title } from './layout';

const None: FunctionComponent = () => {
  return (
    <Box p={3}>
      <Title title='NONE' />
    </Box>
  );
};

export default None;
