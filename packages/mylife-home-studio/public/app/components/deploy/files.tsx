import React, { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';

import { FileIcon } from './icons';
import { useSelection } from './selection';
import { Title } from './layout';

const Files: FunctionComponent = () => {
  const { select } = useSelection();

  return (
    <Title text='Fichiers' icon={FileIcon} />
  );
};

export default Files;
