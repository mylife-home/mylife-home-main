import React, { FunctionComponent } from 'react';
import { ThemeProvider } from '@material-ui/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import { theme } from './theme';
import Layout from './layout';

const Application: FunctionComponent = () => (
  <>
    <CssBaseline />
    
    <ThemeProvider theme={theme}>
      <DndProvider backend={HTML5Backend}>
        <Layout />
      </DndProvider>
    </ThemeProvider>
  </>
);

export default Application;
