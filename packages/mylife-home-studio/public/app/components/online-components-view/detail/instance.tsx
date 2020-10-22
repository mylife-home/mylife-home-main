import React, { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';

import Box from '@material-ui/core/Box';

import { AppState } from '../../../store/types';
import { getInstance } from '../../../store/online-components-view/selectors';
import { Title, Count } from './layout';

const Instance: FunctionComponent<{ id: string }> = ({ id }) => {
  const instance = useSelector((state: AppState) => getInstance(state, id));

  return (
    <Box p={3}>
      <Title type='instance' title={instance.display} />
      <Count value={instance.plugins.length} singular='plugin' plural='plugins' />
      <Count value={instance.components.length} singular='component' plural='components' />
    </Box>
  );
};

export default Instance;
