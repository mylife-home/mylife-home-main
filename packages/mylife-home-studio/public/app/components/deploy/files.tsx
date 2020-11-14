import React, { FunctionComponent, useMemo, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { TableCellDataGetterParams } from 'react-virtualized';
import { useDropzone } from 'react-dropzone';
import clsx from 'clsx';
import humanize from 'humanize-plus';
import { makeStyles, fade } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import CloudDownloadIcon from '@material-ui/icons/CloudDownload';
import EditIcon from '@material-ui/icons/Edit';

import { AppState } from '../../store/types';
import { getFilesIds, getFile } from '../../store/deploy/selectors';
import { uploadFiles, downloadFile, deleteFile, renameFile } from '../../store/deploy/actions';
import VirtualizedTable, { ColumnDefinition } from '../lib/virtualized-table';
import { useFireAsync } from '../lib/use-error-handling';
import DeleteButton from '../lib/delete-button';
import { useActions } from '../lib/use-actions';
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
    border: `2px solid transparent`,
  },
  fileDrag: {
    border: `2px solid ${theme.palette.primary.main}`,
  },
  table: {
    flex: 1,
  },
}));

const Files: FunctionComponent = () => {
  const classes = useStyles();
  const files = useSelector(getFilesIds);
  const { uploadFiles } = useHeaderActions();
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop: uploadFiles });

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
    <Container title={<Title text="Fichiers" icon={FileIcon} />}>
      <div {...getRootProps({
        className: clsx(classes.container, { [classes.fileDrag]: isDragActive }) ,
        onClick: e => { e.stopPropagation(); }
      })}>
        <input {...getInputProps()} />
        <VirtualizedTable data={files} columns={columns} className={classes.table} />
      </div>
    </Container>
  );
};

export default Files;

const FileDate: FunctionComponent<{ id: string }> = ({ id }) => {
  const file = useSelector((state: AppState) => getFile(state, id));
  const value = file.modifiedDate.toLocaleString('fr-FR');

  return <>{value}</>;
};

const FileSize: FunctionComponent<{ id: string }> = ({ id }) => {
  const file = useSelector((state: AppState) => getFile(state, id));
  const value = humanize.fileSize(file.size);

  return <>{value}</>;
};

const ActionsHeader: FunctionComponent = () => {
  const classes = useStyles();
  const { uploadFiles } = useHeaderActions();
  const inputRef = useRef<HTMLInputElement>();

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files);
    uploadFiles(files);
  };

  return (
    <>
      <input ref={inputRef} type="file" hidden multiple onChange={handleUpload} />

      <Tooltip title="Nouveau fichier (ou drag'n'drop sur la liste)">
        <IconButton className={classes.uploadButton} onClick={() => inputRef.current.click()}>
          <CloudUploadIcon />
        </IconButton>
      </Tooltip>
    </>
  );
};

const Actions: FunctionComponent<{ id: string }> = ({ id }) => {
  const classes = useStyles();
  const { downloadFile, deleteFile, renameFile } = useRowActions(id);
  const fireAsync = useFireAsync();
  const showRenameDialog = useRenameDialog(id);

  const onRename = () =>
    fireAsync(async () => {
      const { status, newId } = await showRenameDialog();
      if (status === 'ok') {
        renameFile(newId);
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
  return { ... useActions({ uploadFiles }) };
}

function useRowActions(id: string) {
  const dispatch = useDispatch();
  return useMemo(
    () => ({
      downloadFile: () => dispatch(downloadFile(id)),
      deleteFile: () => dispatch(deleteFile(id)),
      renameFile: (newId: string) => dispatch(renameFile({ id, newId })),
    }),
    [dispatch, id]
  );
}

function useRenameDialog(id: string) {
  const showDialog = useInputDialog();
  const files = useSelector(getFilesIds);

  const options = {
    title: 'Nouveau nom',
    message: 'Entrer le nouveau nom de fichier',
    initialText: id,
    validator(newId: string) {
      if (newId === id) {
        return; // permitted, but won't do anything
      }
      if (!newId) {
        return 'Nom vide';
      }
      if (files.includes(newId)) {
        return 'Ce nom existe déjà';
      }
    }
  };

  return async () => {
    const { status, text: newId } = await showDialog(options);
    if (id === newId) {
      // transform into cancel
      return { status: 'cancel' };
    }

    return { status, newId };
  };
}