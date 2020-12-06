import React, { FunctionComponent, useRef, createContext, useContext, useMemo } from 'react';
import { AutoSizer } from 'react-virtualized';
import { makeStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import FileCopyIcon from '@material-ui/icons/FileCopy';
import EditIcon from '@material-ui/icons/Edit';

import DeleteButton from '../lib/delete-button';
import { useFireAsync } from '../lib/use-error-handling';
import { useInputDialog } from '../dialogs/input';

import { Container, Section, Item, ItemLink } from './layout';

const useStyles = makeStyles((theme) => ({
  list: {
    width: 500,
    overflowY: 'auto',
  },
  newButton: {
    color: theme.palette.success.main,
  },
}));

type CreateNewCallback = (id: string) => void;
type ImportV1Callback = (content: string) => void;
type DeleteCallback = (id: string) => void;
type RenameCallback = (id: string, newId: string) => void;
type DuplicateCallback = (id: string, newId: string) => void;
type OpenCallback = (id: string) => void;

interface ListContextProps {
  ids: string[];
  onDelete: DeleteCallback;
  onRename: RenameCallback;
  onDuplicate: DuplicateCallback;
  onOpen: OpenCallback;
}

const ListContext = createContext<ListContextProps>(null);

export interface ProjectListProps {
  className?: string;
  title: string;
  ids: string[];
  onCreateNew: CreateNewCallback;
  onImportV1: ImportV1Callback;
  onDelete: DeleteCallback;
  onRename: RenameCallback;
  onDuplicate: DuplicateCallback;
  onOpen: OpenCallback;
}

export const ProjectList: FunctionComponent<ProjectListProps> = ({ className, title, ids, onCreateNew, onImportV1, onDelete, onRename, onDuplicate, onOpen, children }) => {
  const classes = useStyles();
  const contextProps = useMemo(() => ({ ids, onDelete, onRename, onDuplicate, onOpen } as ListContextProps), [ids, onDelete, onRename, onDuplicate, onOpen]);

  return (
    <Container className={className}>
      <Section title={title} />

      <CreateNewLink ids={ids} onCreateNew={onCreateNew} />
      <ImportV1Link onImportV1={onImportV1} />

      <Item fullHeight>
        <List className={classes.list}>
          <ListContext.Provider value={contextProps}>{children}</ListContext.Provider>
        </List>
      </Item>
    </Container>
  );
};

export interface ProjectItemProps {
  id: string;
  info: string[];
}

export const ProjectItem: FunctionComponent<ProjectItemProps> = ({ id, info }) => {
  const classes = useStyles();
  const { onDelete, onOpen } = useContext(ListContext);
  const handleDelete = () => onDelete(id);
  const handleOpen = () => onOpen(id);

  return (
    <ListItem button onClick={handleOpen}>
      <ListItemText primary={id} primaryTypographyProps={{ variant: 'body1' }} secondary={info.join(', ')} />

      <ListItemSecondaryAction>
        <DuplicateButton id={id} className={classes.newButton} />
        <RenameButton id={id} />
        <DeleteButton icon tooltip="Supprimer" onConfirmed={handleDelete} />
      </ListItemSecondaryAction>
    </ListItem>
  );
};

const ImportV1Link: FunctionComponent<{ onImportV1: ImportV1Callback }> = ({ onImportV1 }) => {
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
      <ItemLink text="Importer un projet v1" onClick={() => inputRef.current.click()} />
    </>
  );
};

const CreateNewLink: FunctionComponent<{ ids: string[]; onCreateNew: CreateNewCallback }> = ({ ids, onCreateNew }) => {
  const fireAsync = useFireAsync();
  const showNewNewDialog = useNewNameDialog('Nouveau projet', 'Entrer le nom du nouveau projet', ids);

  const handleClick = () =>
    fireAsync(async () => {
      const { status, newId } = await showNewNewDialog();
      if (status === 'ok') {
        onCreateNew(newId);
      }
    });

  return <ItemLink text="Créer un nouveau projet" onClick={handleClick} />;
};

const DuplicateButton: FunctionComponent<{ className?: string; id: string }> = ({ className, id }) => {
  const { ids, onDuplicate } = useContext(ListContext);
  const fireAsync = useFireAsync();
  const showNewNewDialog = useNewNameDialog('Duplication de projet', 'Entrer le nom du projet dupliqué', ids);

  const handleDuplicate = () =>
    fireAsync(async () => {
      const { status, newId } = await showNewNewDialog();
      if (status === 'ok') {
        onDuplicate(id, newId);
      }
    });

  return (
    <Tooltip title="Dupliquer">
      <IconButton onClick={handleDuplicate} className={className}>
        <FileCopyIcon />
      </IconButton>
    </Tooltip>
  );
};

const RenameButton: FunctionComponent<{ className?: string; id: string }> = ({ className, id }) => {
  const { ids, onRename } = useContext(ListContext);
  const fireAsync = useFireAsync();
  const showNewNewDialog = useNewNameDialog('Renommage', 'Entrer le nouveau nom du projet', ids, id);

  const handleRename = () =>
    fireAsync(async () => {
      const { status, newId } = await showNewNewDialog();
      if (status === 'ok') {
        onRename(id, newId);
      }
    });

  return (
    <Tooltip title="Renommer">
      <IconButton onClick={handleRename} className={className}>
        <EditIcon />
      </IconButton>
    </Tooltip>
  );
};

function useNewNameDialog(title: string, message: string, existingIds: string[], id: string = null) {
  const showInput = useInputDialog();

  const options = {
    title,
    message,
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
