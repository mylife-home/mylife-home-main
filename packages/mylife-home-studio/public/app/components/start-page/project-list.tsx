import React, { FunctionComponent, useRef, createContext, useContext, useMemo } from 'react';
import clsx from 'clsx';
import { makeStyles, darken } from '@material-ui/core/styles';
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

import { useLayoutStyles, Container, Section, ItemLink } from './layout';

const useStyles = makeStyles((theme) => ({
  container: {
    minWidth: 500,
  },
  list: {
    maxWidth: 500,
    overflowY: 'auto',

    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: darken(theme.palette.background.paper, 0.1),
  },
  newButton: {
    color: theme.palette.success.main,
  },
}));

type CreateNewCallback = (id: string) => void;
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
  onDelete: DeleteCallback;
  onRename: RenameCallback;
  onDuplicate: DuplicateCallback;
  onOpen: OpenCallback;
}

export const ProjectList: FunctionComponent<ProjectListProps> = ({ className, title, ids, onCreateNew, onDelete, onRename, onDuplicate, onOpen, children }) => {
  const layoutClasses = useLayoutStyles();
  const classes = useStyles();
  const contextProps = useMemo(() => ({ ids, onDelete, onRename, onDuplicate, onOpen }), [ids, onDelete, onRename, onDuplicate, onOpen]);

  return (
    <Container className={clsx(classes.container, className)}>
      <Section title={title} />

      <CreateNewLink ids={ids} onCreateNew={onCreateNew} />

      <List className={clsx(classes.list, layoutClasses.item, layoutClasses.fullHeight)}>
        <ListContext.Provider value={contextProps}>{children}</ListContext.Provider>
      </List>
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
      <ListItemText primary={id} secondary={info.join(', ')} />

      <ListItemSecondaryAction>
        <DuplicateButton id={id} className={classes.newButton} />
        <RenameButton id={id} />
        <DeleteButton icon tooltip="Supprimer" onConfirmed={handleDelete} />
      </ListItemSecondaryAction>
    </ListItem>
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
