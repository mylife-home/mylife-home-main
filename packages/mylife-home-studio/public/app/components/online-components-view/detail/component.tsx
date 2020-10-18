import React, { FunctionComponent, createContext, useContext } from 'react';
import { useSelector } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';

import Box from '@material-ui/core/Box';

import { AppState } from '../../../store/types';
import { getComponent } from '../../../store/online-components-view/selectors';

const Component: FunctionComponent<{ id: string }> = ({ id }) => {
  const component = useSelector((state: AppState) => getComponent(state, id));
  return (
    <Box p={3}>
      {component.display}
    </Box>
  );
};

export default Component;
