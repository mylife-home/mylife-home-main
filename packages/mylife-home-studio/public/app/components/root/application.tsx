import React, { FunctionComponent } from 'react';
import { Provider } from 'react-redux';
import { ThemeProvider } from '@material-ui/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import { store } from '../../store/store';
import { theme } from './theme';
import Layout from './layout';

const Application: FunctionComponent = () => (
  <>
    <CssBaseline />
    
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <DndProvider backend={HTML5Backend}>
          <Layout />
        </DndProvider>
      </ThemeProvider>
    </Provider>
  </>
);

export default Application;
