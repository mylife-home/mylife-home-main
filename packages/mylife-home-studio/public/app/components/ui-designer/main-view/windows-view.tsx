import React, { FunctionComponent } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';

import { WindowIcon } from '../../lib/icons';

const useStyles = makeStyles((theme) => ({
  newButton: {
    color: theme.palette.success.main,
  },
}));

const WindowsView: FunctionComponent = () => {
  const classes = useStyles();
  return (
    <Box>
      <Typography>Windows</Typography>

      <Tooltip title="Nouvelle fenêtre">
        <IconButton className={classes.newButton} onClick={() => console.log('TODO')}>
          <WindowIcon />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export default WindowsView;
