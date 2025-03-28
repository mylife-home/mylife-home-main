import React, { FunctionComponent, useCallback, useState, useEffect, useMemo } from 'react';
import { useModal } from 'react-modal-hook';
import { useSelector, useDispatch } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import Collapse from '@material-ui/core/Collapse';
import IconButton from '@material-ui/core/IconButton';
import ExpandMore from '@material-ui/icons/ExpandMore';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import AddIcon from '@material-ui/icons/Add';
import RemoveIcon from '@material-ui/icons/Remove';
import UndoIcon from '@material-ui/icons/Undo';

import { TransitionProps } from '../../dialogs/common';
import { useSnackbar } from '../../dialogs/snackbar';
import { useConfirmDialog } from '../../dialogs/confirm';
import { useFireAsync } from '../../lib/use-error-handling';
import { AppState } from '../../../store/types';
import { gitCommit, gitRestore, gitDiff, gitDiffDataClear, gitDiffStage } from '../../../store/git/actions';
import { getGitAppUrl, makeGetGitStagingFeatures, makeGetGitStagingFiles, getGitDiffFeature, getGitDiffFile, hasGitDiffStaging, makeGetGitDiffDiscardFiles } from '../../../store/git/selectors';
import DiffView from './git-diff-view';

const useStyles = makeStyles((theme) => ({
  commitPanel: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  list: {
    height: '50vh',
    overflowY: 'auto',
    border: `1px solid ${theme.palette.divider}`,
  },
  indent0: {
    paddingLeft: theme.spacing(4),
  },
  indent1: {
    paddingLeft: theme.spacing(8),
  },
  indent2: {
    paddingLeft: theme.spacing(12),
  },
}));

export function useShowGitDialog() {
  const [onResult, setOnResult] = useState<() => void>();
  const appUrl = useSelector(getGitAppUrl);

  const [showModal, hideModal] = useModal(
    ({ in: open, onExited }: TransitionProps) => {
      const close = () => {
        hideModal();
        onResult();
      };

      const handleKeyDown = (e: React.KeyboardEvent) => {
        switch (e.key) {
          case 'Escape':
            close();
            break;
        }
      };

      const openApp = () => {
        window.open(appUrl, "_blank");
      };

      return (
        <Dialog aria-labelledby="dialog-title" open={open} onExited={onExited} onClose={close} scroll="paper" maxWidth="lg" fullWidth onKeyDown={handleKeyDown}>
          <DialogTitle id="dialog-title">Git</DialogTitle>
    
          <GitDialogContent />
    
          <DialogActions>
            <Button onClick={openApp}>
              GitConvex
            </Button>

            <Button color="primary" onClick={close}>
              Fermer
            </Button>
          </DialogActions>
        </Dialog>
      );
    },
    [onResult, appUrl]
  );

  return useCallback(
    () =>
      new Promise<void>((resolve) => {
        setOnResult(() => resolve); // else useState think resolve is a state updater

        showModal();
      }),
    [setOnResult]
  );
}

const GitDialogContent: FunctionComponent = () => {
  const dispatch = useDispatch();

  // Load diff on show, clear on hide
  useEffect(() => {
    dispatch(gitDiff());

    return () => {
      dispatch(gitDiffDataClear());
    };
  }, []);

  return (
    <DialogContent dividers>
      <CommitPanel />
      <FeatureList />
    </DialogContent>
  );
};

const CommitPanel: FunctionComponent = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const fireAsync = useFireAsync();
  const { enqueueSnackbar } = useSnackbar();
  const [message, setMessage] = useState('');
  const [working, setWorking] = useState(false);
  const hasStaging = useSelector(hasGitDiffStaging);

  const commit = () => fireAsync(async () => {
    setWorking(true);
    try {
      await dispatch(gitCommit({ message }));
      setMessage('');
      enqueueSnackbar('Commit effectué', { variant: 'success' });
    } finally {
      setWorking(false);
    }
  });

  return (
    <div className={classes.commitPanel}>
      <TextField
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        disabled={working}
        helperText={'Message du commit'}
        fullWidth
      />

      <Button onClick={commit} disabled={working || !hasStaging || !message}>
        {working ? '...' : 'Commit'}
      </Button>
    </div>
  );

};

const FeatureList: FunctionComponent = () => {
  const classes = useStyles();

  return (
    <List className={classes.list}>
      <ChangesItem staged={true} />
      <ChangesItem staged={false} />
    </List>
  );
};

const ChangesItem: FunctionComponent<{ staged: boolean; }> = ({ staged }) => {
  const getFeatures = useMemo(() => makeGetGitStagingFeatures(), []);
  const features = useSelector((state: AppState) => getFeatures(state, staged));
  const stage = useStage(!staged, 'all');
  const discard = useDiscard('all');

  if (features.length === 0) {
    return null;
  }

  return (
    <ListItemWithChildren title={staged ? 'Staging' : 'Changements'} indent={0} initialOpened={true} staged={staged} onMainClick={stage} onDiscardClick={discard}>
      <List component="div">
        {features.map(id => (
          <FeatureItem key={id} id={id} staged={staged} />
        ))}
      </List>
    </ListItemWithChildren>
  );
};

const FeatureItem: FunctionComponent<{ id: string; staged: boolean; }> = ({ id, staged }) => {
  const feature = useSelector((store: AppState) => getGitDiffFeature(store, id));
  const getFiles = useMemo(() => makeGetGitStagingFiles(), []);
  const files = useSelector((state: AppState) => getFiles(state, id, staged));
  const stage = useStage(!staged, 'feature', id);
  const discard = useDiscard('feature', id);
  
  return (
    <ListItemWithChildren title={feature.id} indent={1} initialOpened={true} staged={staged} onMainClick={stage} onDiscardClick={discard}>
      <List component="div">
        {files.map(id => (
          <FileItem key={id} id={id} staged={staged} />
        ))}
      </List>
    </ListItemWithChildren>
  );
};

const FileItem: FunctionComponent<{ id: string; staged: boolean; }> = ({ id, staged }) => {
  const file = useSelector((store: AppState) => getGitDiffFile(store, id));
  const stage = useStage(!staged, 'file', id);
  const discard = useDiscard('file', id);

  return (
    <ListItemWithChildren title={file.name} indent={2} initialOpened={false} staged={staged} onMainClick={stage} onDiscardClick={discard}>
      <DiffView chunks={file.chunks} />
    </ListItemWithChildren>
  );
};

interface ListItemWithChildrenProps {
  title: string;
  indent: 0 | 1 | 2;
  initialOpened: boolean;
  staged: boolean;
  onMainClick: () => void;
  onDiscardClick: () => void;
}

const ListItemWithChildren: FunctionComponent<ListItemWithChildrenProps> = ({ title, indent, initialOpened, staged, onMainClick, onDiscardClick, children }) => {
  const [open, setOpen] = useState(initialOpened);
  const indentClass = useIndentClass(indent);

  const handleClick = () => {
    setOpen(!open);
  };

  return (
    <>
      <ListItem button onClick={handleClick} className={indentClass}>
        <ListItemIcon>
          {open ? <ExpandMore /> : <NavigateNextIcon />}
        </ListItemIcon>

        <ListItemText primary={title} />

        <ListItemSecondaryAction>
          {!staged && (
            <IconButton onClick={onDiscardClick}>
              <UndoIcon />
            </IconButton>
          )}
          <IconButton onClick={onMainClick}>
            {staged ? <RemoveIcon /> : <AddIcon />}
          </IconButton>
        </ListItemSecondaryAction>
      </ListItem>

      <Collapse in={open} timeout="auto" unmountOnExit>
        {children}
      </Collapse>
    </>
  );
}

function useIndentClass(indent: 0 | 1 | 2) {
  const classes = useStyles();

  switch (indent) {
    case 0:
      return classes.indent0;
    case 1:
      return classes.indent1;
    case 2:
      return classes.indent2;
    default:
      console.error('Unsupported indent', indent);
      return null;
  }
}

function useStage(stage: boolean, type: 'feature' | 'file' | 'all', id?: string) {
  const dispatch = useDispatch();

  return useCallback(() => {
    dispatch(gitDiffStage({ type, id, stage }));
  }, [dispatch, type, id]);
}

function useDiscard(type: 'feature' | 'file' | 'all', id?: string) {
  const dispatch = useDispatch();
  const fireAsync = useFireAsync();
  const showConfirm = useConfirmDialog();
  const { enqueueSnackbar } = useSnackbar();
  const getGitDiffDiscardFiles = useMemo(() => makeGetGitDiffDiscardFiles(), []);
  const files = useSelector((state: AppState) => getGitDiffDiscardFiles(state, type, id));

  return useCallback(() => fireAsync(async () => {
    const message = 'Vous allez restorer les fichiers suivants :\n' + files.join('\n');
    const { status } = await showConfirm({ message });
    if (status !== 'ok') {
      return;
    }

    await dispatch(gitRestore({ type, id }));
    enqueueSnackbar('Fichiers restorés', { variant: 'success' });
  }), [dispatch, enqueueSnackbar, fireAsync, type, id, files]);
}
