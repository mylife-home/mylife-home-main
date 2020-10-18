import React, { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';

import Box from '@material-ui/core/Box';

import { AppState } from '../../../store/types';
import { getPlugin } from '../../../store/online-components-view/selectors';
import { Title } from './layout';

const Plugin: FunctionComponent<{ id: string }> = ({ id }) => {
  const plugin = useSelector((state: AppState) => getPlugin(state, id));
  return (
    <Box p={3}>
      <Title type='plugin' title={plugin.display} />
    </Box>
  );
};

export default Plugin;
