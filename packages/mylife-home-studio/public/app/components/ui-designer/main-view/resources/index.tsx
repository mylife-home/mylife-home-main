import React, { FunctionComponent, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import CloudDownloadIcon from '@material-ui/icons/CloudDownload';
import EditIcon from '@material-ui/icons/Edit';

import DeleteButton from '../../../lib/delete-button';
import { Container, Title } from '../../../lib/main-view-layout';
import { ImageIcon } from '../../../lib/icons';
import { useTabSelector } from '../../../lib/use-tab-selector';
import { getResourcesIds, getResource } from '../../../../store/ui-designer/selectors';
import Display from './display';
import { formatBinaryLength, download } from './utils';

const useStyles = makeStyles((theme) => ({
  newButton: {
    color: theme.palette.success.main,
  },
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,

    display: 'flex',
    flexDirection: 'row',
  },
  list: {
    width: 500,
    overflowY: 'auto',
  },
  display: {
    flex: 1,
  },
}));

const Resources: FunctionComponent = () => {
  const classes = useStyles();
  const resourcesIds = useTabSelector(getResourcesIds);
  const [selected, setSelected] = useState<string>(null);

  return (
    <Container
      title={
        <>
          <Title text="Resources" icon={ImageIcon} />
  
          <Tooltip title="Ajouter une ressource">
            <IconButton className={classes.newButton} onClick={() => console.log('TODO')}>
              <CloudUploadIcon />
            </IconButton>
          </Tooltip>
        </>
      }
    >
      <div className={classes.wrapper}>
        <List disablePadding className={classes.list}>
          {resourcesIds.map((id) => (
            <ResourceItem key={id} id={id} selected={selected === id} onSelect={() => setSelected(id)} />
          ))}
        </List>

        {selected && (
          <Display className={classes.display} id={selected} />
        )}
      </div>
    </Container>
  );
};

export default Resources;

const ResourceItem: FunctionComponent<{ id: string; selected: boolean; onSelect: () => void; }> = ({ id, selected, onSelect }) => {
  const classes = useStyles();
  const resource = useTabSelector((state, tabId) => getResource(state, tabId, id));

  return (
    <ListItem button selected={selected} onClick={onSelect}>
      <ListItemIcon>
        <ImageIcon />
      </ListItemIcon>

      <ListItemText primary={id} secondary={`${resource.mime} - ${formatBinaryLength(resource)}`} />

      <ListItemSecondaryAction>
        <Tooltip title="Renommer">
          <IconButton onClick={() => console.log('TODO')}>
            <EditIcon />
          </IconButton>
        </Tooltip>

        <Tooltip title="Télécharger">
          <IconButton onClick={() => download(resource)}>
            <CloudDownloadIcon />
          </IconButton>
        </Tooltip>

        <Tooltip title="Remplacer">
          <IconButton className={classes.newButton} onClick={() => console.log('TODO')}>
            <CloudUploadIcon />
          </IconButton>
        </Tooltip>

        <DeleteButton icon tooltip="Supprimer" onConfirmed={() => console.log('TODO')} />
      </ListItemSecondaryAction>
    </ListItem>
  );
};
