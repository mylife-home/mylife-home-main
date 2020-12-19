import React, { FunctionComponent } from 'react';

import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';

const UiDesigner: FunctionComponent = () => (
  <Box p={3}>
    <Typography>Designer UI</Typography>
  </Box>
);

export default UiDesigner;

// TODO
// - state+debounce comme recipe au niveau d'une fenêtre
// - les ressources en live
// - l'update de composants sur le serveur