import React, { FunctionComponent, useRef, createContext, useContext, useMemo } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';

import { useFireAsync } from '../../lib/use-error-handling';
import { useInputDialog } from '../../dialogs/input';

const useStyles = makeStyles((theme) => ({}));

type CreateNewCallback = (id: string) => void;
type ImportV1Callback = (content: string) => void;
type DeleteCallback = (id: string) => void;
type RenameCallback = (id: string, newId: string) => void;
type OpenCallback = (id: string) => void;

interface ListContextProps {
  ids: string[];
  onDelete: DeleteCallback;
  onRename: RenameCallback;
  onOpen: OpenCallback;
}

const ListContext = createContext<ListContextProps>(null);

export interface ProjectListProps {
  ids: string[];
  onCreateNew: CreateNewCallback;
  onImportV1: ImportV1Callback;
  onDelete: DeleteCallback;
  onRename: RenameCallback;
  onOpen: OpenCallback;
}

export const ProjectList: FunctionComponent<ProjectListProps> = ({ ids, onCreateNew, onImportV1, onDelete, onRename, onOpen, children }) => {
  const classes = useStyles();
  const contextProps = useMemo(() => ({ ids, onDelete, onRename, onOpen } as ListContextProps), [ids, onDelete, onRename, onOpen]);

  return (
    <>
      <List>
        <ListContext.Provider value={contextProps}>{children}</ListContext.Provider>
      </List>

      <ImportV1Button onImportV1={onImportV1} />
      <CreateNewButton ids={ids} onCreateNew={onCreateNew} />
    </>
  );
};

export interface ProjectItemProps {
  id: string;
  info: string[];
}

export const ProjectItem: FunctionComponent<ProjectItemProps> = ({ id, info }) => {
  const classes = useStyles();
  const { ids, onDelete, onRename, onOpen } = useContext(ListContext);
  const fireAsync = useFireAsync();
  const showNewNewDialog = useNewNameDialog(ids, id);

  const handleRename = () =>
    fireAsync(async () => {
      const { status, newId } = await showNewNewDialog();
      if (status === 'ok') {
        onRename(id, newId);
      }
    });

  const handleDelete = () => onDelete(id);

  // TODO

  return (
    <ListItem>
      <ListItemText primary={id} primaryTypographyProps={{ variant: 'body1' }} secondary={info.join(', ')} />
    </ListItem>
  );
};

const ImportV1Button: FunctionComponent<{ onImportV1: ImportV1Callback }> = ({ onImportV1 }) => {
  const inputRef = useRef<HTMLInputElement>();
  const fireAsync = useFireAsync();

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files[0];
    fireAsync(async () => {
      const content = await file.text();
      onImportV1(content);
    });
  };

  return (
    <>
      <input ref={inputRef} type="file" hidden onChange={handleUpload} />

      <Tooltip title="Import v1">
        <IconButton onClick={() => inputRef.current.click()}>
          <CloudUploadIcon />
        </IconButton>
      </Tooltip>
    </>
  );
};

const CreateNewButton: FunctionComponent<{ ids: string[]; onCreateNew: CreateNewCallback }> = ({ ids, onCreateNew }) => {
  const fireAsync = useFireAsync();
  const showNewNewDialog = useNewNameDialog(ids);

  const handleClick = () =>
    fireAsync(async () => {
      const { status, newId } = await showNewNewDialog();
      if (status === 'ok') {
        onCreateNew(newId);
      }
    });

  return (
    <Tooltip title="Créer un nouveau projet">
      <IconButton onClick={handleClick}>
        <CloudUploadIcon />
      </IconButton>
    </Tooltip>
  );
};

function useNewNameDialog(existingIds: string[], id: string = null) {
  const showInput = useInputDialog();

  const options = {
    title: 'Nouveau nom',
    message: 'Entrer le nouveau nom de projet',
    initialText: id || 'Nouveau projet',
    validator(newId: string) {
      if (id && newId === id) {
        return; // permitted, but won't do anything
      }
      if (!newId) {
        return 'Nom vide';
      }
      if (existingIds.includes(newId)) {
        return 'Ce nom existe déjà';
      }
    },
  };

  return async () => {
    const { status, text: newId } = await showInput(options);
    if (id && id === newId) {
      // transform into cancel
      return { status: 'cancel' };
    }

    return { status, newId };
  };
}
