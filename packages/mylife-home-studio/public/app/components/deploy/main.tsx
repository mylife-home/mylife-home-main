import React, { FunctionComponent } from 'react';
import Typography from '@material-ui/core/Typography';

import { useSelection } from './selection';
import { Title } from './layout';
import Recipes from './recipes';
import Recipe from './recipe';
import Runs from './runs';
import Run from './run';
import Files from './files';

const Main: FunctionComponent = () => {
  const { selection } = useSelection();

  if (!selection) {
    return <Title text="Aucune sélection" />;
  }

  switch (selection.type) {
    case 'recipes':
      return <Recipes />;
    case 'recipe':
      return <Recipe id={selection.id} />;
    case 'runs':
      return <Runs />;
    case 'run':
      return <Run id={selection.id} />;
    case 'files':
      return <Files />;
  }
};

export default Main;
