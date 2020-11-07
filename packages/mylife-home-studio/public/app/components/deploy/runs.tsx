import React, { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';

import { RunsIcon } from './icons';
import { useSelection } from './selection';
import { Title } from './layout';

const Runs: FunctionComponent = () => {
  const { select } = useSelection();

  return (
    <Title text="Exécutions" icon={RunsIcon} />
  );
};

export default Runs;
