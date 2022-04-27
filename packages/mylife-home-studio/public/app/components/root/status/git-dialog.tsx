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
import Grid from '@material-ui/core/Grid';
import ErrorIcon from '@material-ui/icons/Error';
import WarningIcon from '@material-ui/icons/Warning';
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined';
import Link from '@material-ui/core/Link';

import { TransitionProps, DialogText, DialogSeparator } from '../../dialogs/common';
import { AsyncDispatch } from '../../../store/types';
import { diff } from '../../../store/git/actions';
import { getGitBranch, getGitAppUrl, getGitChangedFeatures } from '../../../store/git/selectors';
import { GitDiff, GitDiffFile } from '../../../store/git/types';
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

interface GitDiffFeature {
  featureName: string;
  files: GitDiffFile[];
}

interface ContextProps {
  changedFeatures: GitDiffFeature[];
}

const Context = createContext<ContextProps>(null);

const GitContextProvider: FunctionComponent = ({ children }) => {
  const changedFeatures = useSelector(getGitChangedFeatures);
  const dispatch = useDispatch<AsyncDispatch<GitDiff>>();
  const fireAsync = useFireAsync();
  const [gitDiff, setGitDiff] = useState<GitDiff>(null);

  // Load diff on show
  useEffect(() => {
    fireAsync(async () => {
      const value = await dispatch(diff());
      setGitDiff(value);
    });
  }, []);
  
  const context = useMemo(() => {
    const map = new Map<string, GitDiffFeature>();

    console.log(changedFeatures);

    for (const featureName of changedFeatures || []) {
      map.set(featureName, { featureName, files: [] });
    }

    for (const file of gitDiff?.files || []) {
      const feature = map.get(file.feature);
      feature.files.push(file);
    }

    const features = Array.from(map.values());

    for (const feature of features) {
      sortBy(feature.files, file => (file.to || file.from));
    }

    sortBy(features, feature => feature.featureName);

    const result: ContextProps = {
      changedFeatures: features
    };

    return result;
  }, [changedFeatures, gitDiff]);

  return (
    <Context.Provider value={context}>
      {children}
    </Context.Provider>
  );
};

const useStyles = makeStyles((theme) => ({
  container: {
    margin: theme.spacing(3),
    display: 'flex',
    flexDirection: 'column',
  },
  feature: {
    '& > :not(:first-child)': {
      marginTop: theme.spacing(1),
    }
  },
  file: {
    marginLeft: theme.spacing(2),
  }
}));

const FeatureList: FunctionComponent = () => {
  const classes = useStyles();
  const { changedFeatures } = useContext(Context);

  return (
    <DialogText value={JSON.stringify(changedFeatures)} />
  );
};

// const FeatureItem: FunctionComponent

const GitAppLink: FunctionComponent = () => {
  const appUrl = useSelector(getGitAppUrl);

  return (
    <Link href={appUrl} color="inherit" target="_blank" rel="noopener noreferrer">GitConvex</Link>
  );
};

function sortBy<T, U>(array: T[], accessor: (value: T) => U) {
  return array.sort((a, b) => {
    const va = accessor(a);
    const vb = accessor(b);
    
    if (va < vb) {
      return -1;
    } else if (va > vb) {
      return 1;
    } else {
      return 0;
    }
  });
}