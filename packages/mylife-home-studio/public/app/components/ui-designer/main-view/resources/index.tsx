import React, { FunctionComponent, useState, useMemo } from 'react';
import { useDispatch } from 'react-redux';
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
import UploadButton from '../../../lib/upload-button';
import UploadZone from '../../../lib/upload-zone';
import { Container, Title } from '../../../lib/main-view-layout';
import { ImageIcon } from '../../../lib/icons';
import { useTabSelector } from '../../../lib/use-tab-selector';
import { useRenameDialog } from '../../../dialogs/rename';
import { useFireAsync } from '../../../lib/use-error-handling';
import { useTabPanelId } from '../../../lib/tab-panel';
import { getResourcesIds, getResource } from '../../../../store/ui-designer/selectors';
import { setResource, clearResource, renameResource } from '../../../../store/ui-designer/actions';
import { UiResource } from '../../../../store/ui-designer/types';
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
  const uploadFiles = useUploadFiles();

  return (
    <Container
      title={
        <>
          <Title text="Resources" icon={ImageIcon} />
  
          <Tooltip title="Ajouter des ressources (ou drag'n'drop)">
            <UploadButton className={classes.newButton} accept="image/*" multiple onUploadFiles={uploadFiles}>
              <CloudUploadIcon />
            </UploadButton>
          </Tooltip>
        </>
      }
    >
      <UploadZone accept="image/*" multiple className={classes.wrapper} onUploadFiles={uploadFiles}>
        <List disablePadding className={classes.list}>
          {resourcesIds.map((id) => (
            <ResourceItem key={id} id={id} selected={selected === id} onSelect={() => setSelected(id)} />
          ))}
        </List>

        {selected && (
          <Display className={classes.display} id={selected} />
        )}
      </UploadZone>
    </Container>
  );
};

export default Resources;

const ResourceItem: FunctionComponent<{ id: string; selected: boolean; onSelect: () => void; }> = ({ id, selected, onSelect }) => {
  const classes = useStyles();
  const resources = useTabSelector(getResourcesIds);
  const resource = useTabSelector((state, tabId) => getResource(state, tabId, id));
  const { setResource, renameResource, clearResource } = useResourcesActions();
  const fireAsync = useFireAsync();
  const showRenameDialog = useRenameDialog(resources, resource.id, 'Entrer le nouveau nom de ressource');

  const onRename = () =>
    fireAsync(async () => {
      const { status, newName } = await showRenameDialog();
      if (status === 'ok') {
        renameResource(resource.id, newName);
      }
    });

  const onReplace = (uploadFiles: File[]) =>
    fireAsync(async () => {
      const resource = await fileToResource(uploadFiles[0]);
      resource.id = id; // keep old name, as we replace
      setResource(resource);
    });

  return (
    <ListItem button selected={selected} onClick={onSelect}>
      <ListItemIcon>
        <ImageIcon />
      </ListItemIcon>

      <ListItemText primary={id} secondary={`${resource.mime} - ${formatBinaryLength(resource)}`} />

      <ListItemSecondaryAction>
        <Tooltip title="Renommer">
          <IconButton onClick={onRename}>
            <EditIcon />
          </IconButton>
        </Tooltip>

        <Tooltip title="Télécharger">
          <IconButton onClick={() => download(resource)}>
            <CloudDownloadIcon />
          </IconButton>
        </Tooltip>

        <Tooltip title="Remplacer">
          <UploadButton className={classes.newButton} accept="image/*" onUploadFiles={onReplace}>
            <CloudUploadIcon />
          </UploadButton>
        </Tooltip>

        <DeleteButton icon tooltip="Supprimer" onConfirmed={() => clearResource(resource.id)} />
      </ListItemSecondaryAction>
    </ListItem>
  );
};

function useUploadFiles() {
  return (uploadFiles: File[]) => {
    console.log('TODO + check mime types for images only');
  };
}

function useResourcesActions() {
  const id = useTabPanelId();
  const dispatch = useDispatch();

  return useMemo(() => ({
    setResource: (resource: UiResource) => dispatch(setResource({ id, resource })),
    clearResource: (resourceId: string) => dispatch(clearResource({ id, resourceId })),
    renameResource: (resourceId: string, newId: string) => dispatch(renameResource({ id, resourceId, newId })),
  }), [dispatch, id]);
}

async function fileToResource(file: File) {
  const buffer = await file.arrayBuffer();
  const binaryString = new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), '');
  const data = btoa(binaryString);

  const filename = file.name;
  const id = filename.substring(0, filename.lastIndexOf('.')) || filename;

  return { id, mime: file.type, data } as UiResource;
}