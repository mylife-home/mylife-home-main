import React, { FunctionComponent, useMemo } from 'react';
import { useSelector } from 'react-redux';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';

import { getUploadFilesProgress } from '../../../store/deploy/selectors';
import { UploadFileProgress } from '../../../store/deploy/types';

const UploadProgressDialog: FunctionComponent = () => {
  const progress = useSelector(getUploadFilesProgress);
  const open = !!progress;
  const { totalSize, doneSize, currentIndex, files } = useProgressInfo(progress);

  return (
    <Dialog aria-labelledby="dialog-title" open={open} scroll="paper" maxWidth="sm" fullWidth>
      <DialogTitle id="dialog-title">{`Upload en cours ...`}</DialogTitle>

      <DialogContent dividers>
        <DialogContentText>{`${doneSize} / ${totalSize} - ${currentIndex} / ${files.length}`}</DialogContentText>

        <List>
          {files.map(file => (
            <ListItem key={file.name}>
              <ListItemText primary={file.name} />
            </ListItem>
          ))}
        </List>
      </DialogContent>

    </Dialog>
  );
};

export default UploadProgressDialog;

interface DisplayFile extends UploadFileProgress {
  status: 'pending' | 'done' | 'executing';
}

function useProgressInfo(progress: UploadFileProgress[]) {
  return useMemo(() => {
    if (!progress) {
      return {
        totalSize: 0,
        doneSize: 0,
        currentIndex: 0,
        files: [],
      };
    }

    const totalSize = progress.reduce((acc, curr) => acc + curr.totalSize, 0);
    const doneSize = progress.reduce((acc, curr) => acc + curr.doneSize, 0);
    const currentIndex = progress.findIndex(file => file.doneSize < file.totalSize);
  
    const files = progress.map(file => ({
      ...file,
      status: getStatus(file),
    }));
  
    return {
      totalSize,
      doneSize,
      currentIndex,
      files,
    };
  }, [progress]);
}

function getStatus(file: UploadFileProgress) {
  if (file.doneSize === 0) {
    return 'pending';
  } else if (file.doneSize === file.totalSize) {
    return 'done';
  } else {
    return 'executing';
  }
}