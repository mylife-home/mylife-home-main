import React, { FunctionComponent, useCallback, useState, useEffect, useMemo } from 'react';
import { useModal } from 'react-modal-hook';
import { useSelector, useDispatch } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Typography from '@material-ui/core/Typography';
import Link from '@material-ui/core/Link';
import Collapse from '@material-ui/core/Collapse';
import ExpandMore from '@material-ui/icons/ExpandMore';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';

import { TransitionProps, DialogText, DialogSeparator } from '../../dialogs/common';
import { AppState } from '../../../store/types';
import { gitDiff, gitDiffDataClear, gitDiffStage } from '../../../store/git/actions';
import { getGitAppUrl, makeGetGitStagingFeatures, makeGetGitStagingFiles, getGitDiffFeature, getGitDiffFile, getGitDiffChunk } from '../../../store/git/selectors';
import { GitDiff, diff } from '../../../store/git/types';
import { useFireAsync } from '../../lib/use-error-handling';

export function useShowGitDialog() {
  const [onResult, setOnResult] = useState<() => void>();

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

      return (
        <Dialog aria-labelledby="dialog-title" open={open} onExited={onExited} onClose={close} scroll="paper" maxWidth="lg" fullWidth onKeyDown={handleKeyDown}>
          <DialogTitle id="dialog-title">Git</DialogTitle>
    
          <GitDialogContent />
    
          <DialogActions>
            <Button color="primary" onClick={close}>
              Fermer
            </Button>
          </DialogActions>
        </Dialog>
      );
    },
    [onResult]
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
      <FeatureList />

      <GitAppLink />
    </DialogContent>
  );
};

const useStyles = makeStyles((theme) => ({
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

  if (features.length === 0) {
    return null;
  }

  return (
    <ListItemWithChildren title={staged ? 'Staging' : 'Changements'} indent={0} initialOpened={true}>
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
  
  return (
    <ListItemWithChildren title={feature.id} indent={1} initialOpened={true}>
      <List component="div">
        {files.map(id => (
          <FileItem key={id} id={id} />
        ))}
      </List>
    </ListItemWithChildren>
  );
};

const FileItem: FunctionComponent<{ id: string }> = ({ id }) => {
  const file = useSelector((store: AppState) => getGitDiffFile(store, id));

  return (
    <ListItemWithChildren title={file.name} indent={2} initialOpened={false}>
      {file.chunks.map(chunkId => (
        <ChunkView key={chunkId} chunkId={chunkId} />
      ))}
    </ListItemWithChildren>
  );
};

const ChunkView: FunctionComponent<{ chunkId: string }> = ({ chunkId }) => {
  const chunk = useSelector((store: AppState) => getGitDiffChunk(store, chunkId));

  return <>{JSON.stringify(chunk)}</>;
}

const ListItemWithChildren: FunctionComponent<{ title: string; indent: 0 | 1 | 2; initialOpened: boolean }> = ({ title, indent, initialOpened, children }) => {
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
      </ListItem>

      <Collapse in={open} timeout="auto" unmountOnExit>
        {children}
      </Collapse>
    </>
  );
}

const GitAppLink: FunctionComponent = () => {
  const appUrl = useSelector(getGitAppUrl);

  return (
    <Link href={appUrl} color="inherit" target="_blank" rel="noopener noreferrer">GitConvex</Link>
  );
};

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