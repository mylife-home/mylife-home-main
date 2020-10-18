import React, { FunctionComponent, createContext, useContext } from 'react';
import { useSelector } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';

import Box from '@material-ui/core/Box';

import { AppState } from '../../../store/types';
import { getComponent } from '../../../store/online-components-view/selectors';
import { Title } from './layout';

const Component: FunctionComponent<{ id: string }> = ({ id }) => {
  const component = useSelector((state: AppState) => getComponent(state, id));
  return (
    <Box p={3}>
      <Title type='component' title={component.display} />
    </Box>
  );
};

export default Component;
