import React, { FunctionComponent } from 'react';
import { makeStyles, darken } from '@material-ui/core/styles';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import Badge from '@material-ui/core/Badge';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';

import { Container, Title } from '../../lib/main-view-layout';
import { ProjectIcon, ComponentIcon, InstanceIcon } from '../../lib/icons';
import { useTabSelector } from '../../lib/use-tab-selector';
import { getComponentsIds, getComponentAndPlugin } from '../../../store/ui-designer/selectors';

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
  list: {
    width: 900,
    overflowY: 'auto',
  },
}));

const Components: FunctionComponent = () => {
  const classes = useStyles();
  const componentsIds = useTabSelector(getComponentsIds);

  return (
    <Container
      title={
        <>
          <Title text="Composants" icon={ComponentIcon} />
  

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
        </>
      }
    >
      <List disablePadding className={classes.list}>
        {componentsIds.map((id) => (
          <ComponentItem key={id} id={id} />
        ))}
      </List>
    </Container>
  );
};

export default Components;

const ComponentItem: FunctionComponent<{ id: string; }> = ({ id }) => {
  const { component, plugin } = useTabSelector((state, tabId) => getComponentAndPlugin(state, tabId, id));

  return (
    <ListItem>
      <ListItemText primary={component.id} secondary={plugin.id} />
    </ListItem>
  )
};