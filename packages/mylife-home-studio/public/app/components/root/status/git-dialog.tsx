import React, { FunctionComponent, useCallback, useState, useMemo } from 'react';
import { useModal } from 'react-modal-hook';
import { useSelector } from 'react-redux';
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
import ErrorIcon from '@material-ui/icons/Error';
import WarningIcon from '@material-ui/icons/Warning';
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined';
import Link from '@material-ui/core/Link';

import { TransitionProps, DialogText, DialogSeparator } from '../../dialogs/common';
import { getGitBranch, getGitAppUrl, getGitChangedFeatures, getGitChangedFiles, getGitCommitsCount } from '../../../store/git/selectors';

export function useShowGitDialog() {
  const [onResult, setOnResult] = useState<() => void>();

  const [showModal, hideModal] = useModal(
    ({ in: open, onExited }: TransitionProps) => {
      const appUrl = useSelector(getGitAppUrl);
      // const classes = useStyles();

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
    
          <DialogContent dividers>
            <DialogText value={'TODO'} />
            <Link href={appUrl} color="inherit" target="_blank" rel="noopener noreferrer">GitConvex</Link>
          </DialogContent>
    
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

/*


const gitPopoverStyles = makeStyles((theme) => ({
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

const GitPopopver: FunctionComponent = () => {
  const classes = gitPopoverStyles();
  const changedFeatures = useSelector(getGitChangedFeatures);
  const changedFiles = useSelector(getGitChangedFiles);

  return (
    <div className={classes.container}>
      {changedFeatures.map(feature => {
        const files = changedFiles[feature];
        return (
          <React.Fragment key={feature}>
            <Grid item xs={12}>
              <Typography className={classes.feature} variant="h6">{feature}</Typography>
            </Grid>

            {files.map(file => (
              <Grid key={file} item xs={12}>
                <Typography className={classes.file}>{file}</Typography>
              </Grid>
            ))}
          </React.Fragment>        
        );
      })}

    </div>
  );
};

*/