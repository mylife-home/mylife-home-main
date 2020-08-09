import React, { FunctionComponent } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';

export interface StartPageProps {
  onNewCoreDesigner: () => void;
}

const StartPage: FunctionComponent<StartPageProps> = ({ onNewCoreDesigner }) => {

  return (
    <Box p={3}>
      <Typography>Démarrage</Typography>
      <Button onClick={onNewCoreDesigner}>Nouveau designer core</Button>
    </Box>
  );
};

export default StartPage;