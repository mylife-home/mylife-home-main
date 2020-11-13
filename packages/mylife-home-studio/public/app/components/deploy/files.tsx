import React, { FunctionComponent, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { TableCellDataGetterParams } from 'react-virtualized';
import humanize from 'humanize-plus';
import { makeStyles, fade } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import CloudDownloadIcon from '@material-ui/icons/CloudDownload';
import EditIcon from '@material-ui/icons/Edit';

import { AppState } from '../../store/types';
import { getFilesIds, getFile } from '../../store/deploy/selectors';
import { uploadFile, downloadFile, deleteFile } from '../../store/deploy/actions';
import VirtualizedTable, { ColumnDefinition } from '../lib/virtualized-table';
import { useFireAsync } from '../lib/use-error-handling';
import DeleteButton from '../lib/delete-button';
import { useInputDialog } from '../dialogs/input';
import { Container, Title } from './layout';
import { FileIcon } from './icons';

const useStyles = makeStyles((theme) => ({
  uploadButton: {
    color: theme.palette.success.main,
  },
  downloadButton: {
    color: theme.palette.success.main,
  },
  deleteButton: {
    color: theme.palette.error.main,
    backgroundColor: 'transparent',
    '&:hover': {
      backgroundColor: fade(theme.palette.text.primary, theme.palette.action.hoverOpacity), // fade = alpha
    },
  },
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  table: {
    flex: 1,
  }
}));

const Files: FunctionComponent = () => {
  const classes = useStyles();
  const files = useSelector(getFilesIds);

  const cellDataGetter = ({ rowData }: TableCellDataGetterParams) => rowData;
  const dateRenderer = (id: string) => <FileDate id={id} />;
  const sizeRenderer = (id: string) => <FileSize id={id} />;
  const actionHeaderRenderer = () => <ActionsHeader />;
  const actionsRenderer = (id: string) => <Actions id={id} />;

  const columns: ColumnDefinition[] = [
    { dataKey: 'id', width: 500, headerRenderer: 'Nom', cellDataGetter },
    { dataKey: 'modifiedDate', width: 150, headerRenderer: 'Date de modification', cellDataGetter, cellRenderer: dateRenderer },
    { dataKey: 'size', width: 150, headerRenderer: 'Taille', cellDataGetter, cellRenderer: sizeRenderer },
    { dataKey: 'actions', width: 150, headerRenderer: actionHeaderRenderer, cellDataGetter, cellRenderer: actionsRenderer },
  ];

  return (
    <Container
      title={
        <Title text="Fichiers" icon={FileIcon} />
      }
    >
      <div className={classes.container}>
        <VirtualizedTable data={files} columns={columns} className={classes.table} />
      </div>
    </Container>
  );
};

export default Files;

const FileDate: FunctionComponent<{ id: string; }> = ({ id }) => {
  const file = useSelector((state: AppState) => getFile(state, id));
  const value = file.modifiedDate.toLocaleString('fr-FR');

  return (
    <>
      {value}
    </>
  );
};

const FileSize: FunctionComponent<{ id: string; }> = ({ id }) => {
  const file = useSelector((state: AppState) => getFile(state, id));
  const value = humanize.fileSize(file.size);

  return (
    <>
      {value}
    </>
  );
};

const ActionsHeader: FunctionComponent = () => {
  const classes = useStyles();
  const { uploadFile } = useHeaderActions();

  return (
    <Tooltip title="Nouveau fichier">
      <IconButton className={classes.uploadButton} onClick={uploadFile}>
        <CloudUploadIcon />
      </IconButton>
    </Tooltip>
  );
}

const Actions: FunctionComponent<{ id: string; }> = ({ id }) => {
  const classes = useStyles();
  const { downloadFile, deleteFile } = useActions(id);
  const showModal = useInputDialog();
  const fireAsync = useFireAsync();

  const onRename = () => fireAsync(async () => {
    const { status, text } = await showModal({ title: 'Nouveau nom', message: 'Entrer le nouveau nom de fichier', initialText: id });
    if(status === 'ok') {
      console.log('RENAME TODO', text);
    }
  });

  return (
    <>
      <Tooltip title="Télécharger">
        <IconButton className={classes.downloadButton} onClick={downloadFile}>
          <CloudDownloadIcon />
        </IconButton>
      </Tooltip>

      <Tooltip title="Renommer">
        <IconButton onClick={onRename}>
          <EditIcon />
        </IconButton>
      </Tooltip>

      <DeleteButton icon tooltip="Supprimer" className={classes.deleteButton} onConfirmed={deleteFile} />
    </>
  );
};

function useHeaderActions() {
  const dispatch = useDispatch();
  return useMemo(() => ({
    uploadFile: () => dispatch(uploadFile()),
  }), [dispatch]);
}

function useActions(id: string) {
  const dispatch = useDispatch();
  return useMemo(() => ({
    downloadFile: () => dispatch(downloadFile(id)),
    deleteFile: () => dispatch(deleteFile(id)),
  }), [dispatch, id]);
}