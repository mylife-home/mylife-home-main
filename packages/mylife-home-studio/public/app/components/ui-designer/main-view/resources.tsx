import React, { FunctionComponent, useState } from 'react';
import { useSelector } from 'react-redux';
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

import DeleteButton from '../../lib/delete-button';
import { useFireAsync } from '../../lib/use-error-handling';
import { useAction } from '../../lib/use-actions';
import { Container, Title } from '../../lib/main-view-layout';
import { ImageIcon } from '../../lib/icons';
import { useTabPanelId } from '../../lib/tab-panel';
import { AppState } from '../../../store/types';
import { getResourcesIds } from '../../../store/ui-designer/selectors';

const useStyles = makeStyles((theme) => ({
  newButton: {
    color: theme.palette.success.main,
  },
  list: {
    width: 500,
  },
  display: {

  },
}));

const Resources: FunctionComponent = () => {
  const classes = useStyles();
  const tabId = useTabPanelId();
  const resourcesIds = useSelector((state: AppState) => getResourcesIds(state, tabId));
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
      <List disablePadding className={classes.list}>
        {resourcesIds.map((id) => (
          <ResourceItem key={id} id={id} selected={selected === id} onSelect={() => setSelected(id)} />
        ))}
      </List>
      <ResourceDisplay className={classes.display} id={selected} />
    </Container>
  );
};

export default Resources;

const ResourceItem: FunctionComponent<{ id: string; selected: boolean; onSelect: () => void; }> = ({ id, selected, onSelect }) => {
  const classes = useStyles();
  return (
    <ListItem button selected={selected} onClick={onSelect}>
      <ListItemIcon>
        <ImageIcon />
      </ListItemIcon>

      <ListItemText primary={id} secondary={'TODO size/type'} />

      <ListItemSecondaryAction>
        <Tooltip title="Renommer">
          <IconButton onClick={() => console.log('TODO')}>
            <EditIcon />
          </IconButton>
        </Tooltip>

        <Tooltip title="Télécharger">
          <IconButton onClick={() => console.log('TODO')}>
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

const ResourceDisplay: FunctionComponent<{ id: string; className: string; }> = ({ id }) => {
  return <>{id}</>;
};