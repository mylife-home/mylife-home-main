import React, { FunctionComponent } from 'react';
import { ThemeProvider } from '@material-ui/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import StoreProvider from '../lib/store-provider';
import { theme } from '../lib/theme';
import DialogProvider from '../dialogs/provider';
import Layout from './layout';

import { store } from '../../store/store';
import { newTab } from '../../store/tabs/actions';
import { TabType } from '../../store/tabs/types';

store.dispatch(newTab({
  id: 'start-page',
  type: TabType.START_PAGE,
  title: 'Démarrage',
  closable: false,
  data: null
}));

const Application: FunctionComponent = () => (
  <>
    <CssBaseline />
    
    <StoreProvider>
      <ThemeProvider theme={theme}>
        <DndProvider backend={HTML5Backend}>
          <DialogProvider>
            <Layout />
          </DialogProvider>
        </DndProvider>
      </ThemeProvider>
    </StoreProvider>
  </>
);

export default Application;
