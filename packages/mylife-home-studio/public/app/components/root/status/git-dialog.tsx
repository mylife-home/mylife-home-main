import React, { FunctionComponent, useCallback, useState, useEffect, useMemo, createContext, useContext } from 'react';
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
import { AsyncDispatch } from '../../../store/types';
import { gitDiff } from '../../../store/git/actions';
import { getGitAppUrl, getGitChangedFeatures } from '../../../store/git/selectors';
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
  return (
    <GitContextProvider>
      <DialogContent dividers>
        <FeatureList />

        <GitAppLink />
      </DialogContent>
    </GitContextProvider>
  );
};

interface Feature {
  name: string;
  files: string[];
}

interface File extends Omit<diff.File, 'feature'> {
  id: string;
  name: string;
}

interface ContextProps {
  featureList: string[];
  features: { [name: string]: Feature };
  files: { [id: string]: File };
}

const Context = createContext<ContextProps>(null);

const GitContextProvider: FunctionComponent = ({ children }) => {
  const changedFeatures = useSelector(getGitChangedFeatures);
  const dispatch = useDispatch<AsyncDispatch<GitDiff>>();
  const fireAsync = useFireAsync();
  const [rawDiff, setRawDiff] = useState<GitDiff>(null);

  // Load diff on show
  useEffect(() => {
    fireAsync(async () => {
      const value = await dispatch(gitDiff());
      setRawDiff(value);
    });
  }, []);
  
  const context = useMemo(() => {
    const result: ContextProps = {
      featureList: [],
      features: {},
      files: {}
    };

    for (const name of Array.from(changedFeatures || []).sort()) {
      result.featureList.push(name);
      result.features[name] = { name, files: [] };
    }

    for (const file of rawDiff?.files || []) {
      const id = file.to || file.from;
      const { feature: featureName, ...props } = file;
      const parts = id.split('/');
      const name = parts[parts.length - 1];
      const newFile = { id, name, ...props };

      const feature = result.features[featureName];
      result.files[id] = newFile;
      feature.files.push(id);
    }

    for (const feature of Object.values(result.features)) {
      feature.files.sort();
    }

    return result;
  }, [changedFeatures, rawDiff]);

  return (
    <Context.Provider value={context}>
      {children}
    </Context.Provider>
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
  const { featureList } = useContext(Context);

  return (
    <List className={classes.list}>
      {featureList.map(name => (
        <FeatureItem key={name} name={name} />
      ))}
    </List>
  );
};

const FeatureItem: FunctionComponent<{ name: string }> = ({ name }) => {
  const { features } = useContext(Context);
  const feature = features[name];

  return (
    <>
      <ListItemWithChildren title={feature.name} indent={0}>
        <List component="div">
          {feature.files.map(id => (
            <FileItem key={id} id={id} />
          ))}
        </List>
      </ListItemWithChildren>
    </>
  );
};

const FileItem: FunctionComponent<{ id: string }> = ({ id }) => {
  const { files } = useContext(Context);
  const file = files[id];

  return (
    <>
      <ListItemWithChildren title={file.name} indent={1}>
        {file.chunks.map((chunk, index) => (
          <ChunkView key={index} chunk={chunk} />
        ))}
      </ListItemWithChildren>
    </>
  );
};

const ChunkView: FunctionComponent<{ chunk: diff.Chunk }> = ({ chunk }) => {
  return <>{JSON.stringify(chunk)}</>;
}

const ListItemWithChildren: FunctionComponent<{ title: string; indent: 0 | 1 | 2 }> = ({ title, indent, children }) => {
  const [open, setOpen] = useState(true);
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