import React, { FunctionComponent } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';

import { ImageIcon } from '../../lib/icons';

const useStyles = makeStyles((theme) => ({
  newButton: {
    color: theme.palette.success.main,
  },
}));

const Resources: FunctionComponent = () => {
  const classes = useStyles();
  return (
    <Box>
      <Typography>Resources</Typography>

      <Tooltip title="Ajouter une ressource">
        <IconButton className={classes.newButton} onClick={() => console.log('TODO')}>
          <ImageIcon />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export default Resources;
