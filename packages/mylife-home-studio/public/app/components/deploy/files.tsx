import React, { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';
import Box from '@material-ui/core/Box';

import { FileIcon } from './icons';
import { useSelection } from './selection';
import { Title } from './layout';

const Files: FunctionComponent = () => {
  const { select } = useSelection();

  return (
    <Box p={3}>
      <Title text="Fichiers" icon={FileIcon} />
    </Box>
  );
};

export default Files;
