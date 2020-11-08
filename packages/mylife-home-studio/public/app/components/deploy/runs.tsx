import React, { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';
import Box from '@material-ui/core/Box';

import { RunsIcon } from './icons';
import { useSelection } from './selection';
import { Title } from './layout';

const Runs: FunctionComponent = () => {
  const { select } = useSelection();

  return (
    <Box p={3}>
      <Title text="Exécutions" icon={RunsIcon} />
    </Box>
  );
};

export default Runs;
