import React, { FunctionComponent } from 'react';
import { ThemeProvider } from '@material-ui/styles';
import CssBaseline from '@material-ui/core/CssBaseline';

import { theme } from './theme';
import Layout from './layout';

const Application: FunctionComponent = () => (
  <>
    <CssBaseline />
    
    <ThemeProvider theme={theme}>
      <Layout />
    </ThemeProvider>
  </>
);

export default Application;
