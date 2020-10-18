import React, { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';

import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';

import { AppState } from '../../../store/types';
import { getInstance } from '../../../store/online-components-view/selectors';
import { Title } from './layout';

const Instance: FunctionComponent<{ id: string }> = ({ id }) => {
  const instance = useSelector((state: AppState) => getInstance(state, id));
  return (
    <Box p={3}>
      <Title type='instance' title={instance.display} />

      <Typography>{JSON.stringify(instance.plugins)}</Typography>
      <Typography>{JSON.stringify(instance.components)}</Typography>
    </Box>
  );
};

export default Instance;
