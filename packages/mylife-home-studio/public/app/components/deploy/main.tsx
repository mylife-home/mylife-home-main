import React, { FunctionComponent } from 'react';
import Box from '@material-ui/core/Box';

import { Title } from '../lib/main-view-layout';
import { useSelection } from './selection';
import Recipes from './recipes';
import Recipe from './recipe';
import Runs from './runs';
import Run from './run';
import Files from './files';

const Main: FunctionComponent = () => {
  const { selection } = useSelection();

  if (!selection) {
    return (
      <Box p={3}>
        <Title text="<Aucune sélection>" />
      </Box>
    );
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
