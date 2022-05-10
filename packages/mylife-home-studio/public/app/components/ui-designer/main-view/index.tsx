import React, { FunctionComponent } from 'react';

import { useSelection } from '../selection';
import Project from './project';
import { Windows, Templates } from './list';
import Window from './window';
import Template from './template';
import Resources from './resources';
import Styles from './styles';
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
    case 'templates':
      return <Templates />;
    case 'template':
      return <Template id={selection.id} />;
    case 'resources':
      return <Resources />;
    case 'styles':
      return <Styles />;
    case 'components':
      return <Components />;
  }
};

export default Main;
