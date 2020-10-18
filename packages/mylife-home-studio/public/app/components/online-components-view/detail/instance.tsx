import React, { FunctionComponent, createContext, useContext } from 'react';
import { useSelector } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';

import Box from '@material-ui/core/Box';

import { AppState } from '../../../store/types';
import { getInstance } from '../../../store/online-components-view/selectors';
import { Title } from './layout';

const Instance: FunctionComponent<{ id: string }> = ({ id }) => {
  const instance = useSelector((state: AppState) => getInstance(state, id));
  return (
    <Box p={3}>
      <Title type='instance' title={instance.display} />
    </Box>
  );
};

export default Instance;
