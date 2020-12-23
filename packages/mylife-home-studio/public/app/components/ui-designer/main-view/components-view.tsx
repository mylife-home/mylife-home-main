import React, { FunctionComponent } from 'react';
import { makeStyles, darken } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import Badge from '@material-ui/core/Badge';

import { ProjectIcon, ComponentIcon, InstanceIcon } from '../../lib/icons';

const useStyles = makeStyles((theme) => ({
  newButton: {
    color: theme.palette.success.main,
  },
  badge: {
    background: null,
    color: darken(theme.palette.background.paper, 0.4),
  },
  badgeIcon: {
    height: 12,
    width: 12,
  },
}));

const ComponentsView: FunctionComponent = () => {
  const classes = useStyles();
  return (
    <Box>
      <Typography>Components</Typography>

      <Tooltip title="Rafraîchir les composants depuis un projet core">
        <IconButton onClick={() => console.log('TODO')}>
          <Badge badgeContent={<ProjectIcon className={classes.badgeIcon} />} classes={{badge: classes.badge}}>
            <ComponentIcon />
          </Badge>
        </IconButton>
      </Tooltip>

      <Tooltip title="Rafraîchir les composants depuis les instances en ligne">
        <IconButton onClick={() => console.log('TODO')}>
          <Badge badgeContent={<InstanceIcon className={classes.badgeIcon} />} classes={{badge: classes.badge}}>
            <ComponentIcon />
          </Badge>
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export default ComponentsView;
