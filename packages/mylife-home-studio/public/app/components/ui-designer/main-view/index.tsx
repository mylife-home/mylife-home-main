import React, { FunctionComponent } from 'react';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';

import { useSelection } from '../selection';
import Project from './project';
import Windows from './windows';
import Window from './window';
import Resources from './resources';
import Components from './components';

const Main: FunctionComponent = () => {
  const { selection } = useSelection();

  switch (selection.type) {
    case 'project':
      return <Project />;
    case 'windows':
      return <Windows />;
    case 'window':
      return <Window id={selection.id} />;
    case 'resources':
      return <Resources />;
    case 'components':
      return <Components />;
  }
};

export default Main;
