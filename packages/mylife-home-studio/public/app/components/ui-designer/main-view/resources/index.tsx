import React, { FunctionComponent, useState, useMemo, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import Divider from '@material-ui/core/Divider';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import CloudDownloadIcon from '@material-ui/icons/CloudDownload';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';

import DeleteButton from '../../../lib/delete-button';
import UploadButton from '../../../lib/upload-button';
import UploadZone from '../../../lib/upload-zone';
import { Container, Title } from '../../../lib/main-view-layout';
import { ImageIcon } from '../../../lib/icons';
import { useTabSelector } from '../../../lib/use-tab-selector';
import { useRenameDialog } from '../../../dialogs/rename';
import { useFireAsync } from '../../../lib/use-error-handling';
import { useTabPanelId } from '../../../lib/tab-panel';
import { makeUniqueId } from '../../../lib/make-unique-id';
import { AppState } from '../../../../store/types';
import { getResourcesIds, getResource, makeGetResourceUsage } from '../../../../store/ui-designer/selectors';
import { setResource, clearResource, renameResource } from '../../../../store/ui-designer/actions';
import { UiResource } from '../../../../store/ui-designer/types';
import { useRemoveUsageConfirmDialog } from '../common/remove-usage-confirm-dialog';
import Display from './display';
import { formatBinaryLength, download } from './utils';

const useStyles = makeStyles((theme) => ({
  newButton: {
    color: theme.palette.success.main,
  },
  deleteButton: {
    color: theme.palette.error.main,
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
  const fireAsync = useFireAsync();
  const resourcesIds = useTabSelector(getResourcesIds);
  const { setResource } = useResourcesActions();
  const [selection, select] = useSelection(resourcesIds);
  
  const onUploadFiles = (uploadFiles: File[]) =>
    fireAsync(async () => {
      // this does not really support concurrency
      const existingIds = new Set(resourcesIds);
      for (const file of uploadFiles) {
        // ignore non-image files
        if (!file.type.startsWith('image/')) {
          continue;
        }

        const resource = await fileToResource(file);
        resource.id = makeUniqueId(existingIds, resource.id);
        existingIds.add(resource.id);
        setResource(resource);
      }
    });

  return (
    <Container
      title={
        <>
          <Title text="Resources" icon={ImageIcon} />
  
          <Tooltip title="Ajouter des ressources (ou drag'n'drop)">
            <UploadButton className={classes.newButton} accept="image/*" multiple onUploadFiles={onUploadFiles}>
              <CloudUploadIcon />
            </UploadButton>
          </Tooltip>
        </>
      }
    >
      <UploadZone accept="image/*" multiple className={classes.wrapper} onUploadFiles={onUploadFiles}>
        <List disablePadding className={classes.list}>
          {resourcesIds.map((id) => (
            <ResourceItem key={id} id={id} selected={selection === id} onSelect={() => select(id)} />
          ))}
        </List>

        <Divider orientation="vertical" />
        
        {selection && (
          <Display className={classes.display} id={selection} />
        )}
      </UploadZone>
    </Container>
  );
};

export default Resources;

const ResourceItem: FunctionComponent<{ id: string; selected: boolean; onSelect: () => void; }> = ({ id, selected, onSelect }) => {
  const classes = useStyles();
  const getResourceUsage = useMemo(() => makeGetResourceUsage(), []);
  const resources = useTabSelector(getResourcesIds);
  const resource = useSelector((state: AppState) => getResource(state, id));
  const usage = useTabSelector((state, tabId) => getResourceUsage(state, tabId, id));
  const { setResource, renameResource, clearResource } = useResourcesActions();
  const fireAsync = useFireAsync();
  const showRenameDialog = useRenameDialog(resources, resource.id, 'Entrer le nouveau nom de ressource');
  const showRemoveUsageConfirmDialog = useRemoveUsageConfirmDialog();

  const onRename = () =>
    fireAsync(async () => {
      const { status, newName } = await showRenameDialog();
      if (status === 'ok') {
        renameResource(resource.id, newName);
      }
    });

  const onReplace = (uploadFiles: File[]) =>
    fireAsync(async () => {
      const file = uploadFiles[0];

      // ignore non-image files
      if (!file.type.startsWith('image/')) {
        return;
      }

      const resource = await fileToResource(file);
      resource.id = id; // keep old name, as we replace
      setResource(resource);
    });

    
  const onRemoveWithUsage = () =>
    fireAsync(async () => {
      const { status } = await showRemoveUsageConfirmDialog({ 
        title: 'Supprimer la ressource',
        message: 'La ressource est utilisée :',
        usage
      });
      
      if (status === 'ok') {
        clearResource(resource.id);
      }
    });

  const onRemove = () => {
    clearResource(resource.id);
  };

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


        {usage.length === 0 ? (
          <DeleteButton icon tooltip="Supprimer" onConfirmed={onRemove} />
        ) : (
          <Tooltip title="Supprimer">
            <IconButton className={classes.deleteButton} onClick={onRemoveWithUsage}>
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        )}
      </ListItemSecondaryAction>
    </ListItem>
  );
};

function useResourcesActions() {
  const tabId = useTabPanelId();
  const dispatch = useDispatch();

  return useMemo(() => ({
    setResource: (resource: UiResource) => dispatch(setResource({ tabId, resource })),
    clearResource: (resourceId: string) => dispatch(clearResource({ tabId, resourceId })),
    renameResource: (resourceId: string, newId: string) => dispatch(renameResource({ tabId, resourceId, newId })),
  }), [dispatch, tabId]);
}

async function fileToResource(file: File) {
  const buffer = await file.arrayBuffer();
  const binaryString = new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), '');
  const data = btoa(binaryString);

  const filename = file.name;
  const id = filename.substring(0, filename.lastIndexOf('.')) || filename;

  return { id, mime: file.type, data } as UiResource;
}

function useSelection(ids: string[]): [string, (id: string) => void] {
  const [selection, select] = useState<string>(null);
  const idSet = useMemo(() => new Set(ids), [ids]);

  // auto-reset selection to null if id does not exist anymore (deleted/renamed)
  useEffect(() => {
    if (selection && !idSet.has(selection)) {
      select(null);
    }
  }, [selection, idSet]);

  const finalSelection = idSet.has(selection) ? selection : null;

  return [finalSelection, select];
}
