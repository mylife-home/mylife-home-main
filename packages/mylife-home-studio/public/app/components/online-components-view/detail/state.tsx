import React, { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';

import Box from '@material-ui/core/Box';

import { AppState } from '../../../store/types';
import { getState } from '../../../store/online-components-view/selectors';
import { Title } from './layout';

const State: FunctionComponent<{ id: string }> = ({ id }) => {
  const state = useSelector((state: AppState) => getState(state, id));
  return (
    <Box p={3}>
      <Title type='state' title={state.name} />
    </Box>
  );
};

export default State;
