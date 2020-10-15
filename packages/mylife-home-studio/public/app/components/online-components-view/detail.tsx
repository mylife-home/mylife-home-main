import React, { FunctionComponent, createContext, useContext } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import Box from '@material-ui/core/Box';

import { Selection } from './types';

const Detail: FunctionComponent<{ selection: Selection }> = ({ selection }) => {
  return (
    <Box p={3}>
      {JSON.stringify(selection)}
    </Box>
  );
};

export default Detail;
