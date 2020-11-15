import React, { FunctionComponent, useMemo } from 'react';
import { useSelector } from 'react-redux';
import humanize from 'humanize-plus';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import Typography from '@material-ui/core/Typography';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import CheckIcon from '@material-ui/icons/Check';
import HourglassEmptyIcon from '@material-ui/icons/HourglassEmpty';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';

import { getUploadFilesProgress } from '../../../store/deploy/selectors';
import { TransferFileProgress } from '../../../store/deploy/types';

const UploadProgressDialog: FunctionComponent = () => {
  const progress = useSelector(getUploadFilesProgress);
  const open = !!progress;
  const { totalSize, doneSize, percent, doneFiles, files } = useProgressInfo(progress);

  return (
    <Dialog aria-labelledby="dialog-title" open={open} scroll="paper" maxWidth="sm" fullWidth>
      <DialogTitle id="dialog-title">{`Upload en cours (${percent.toFixed()} %)`}</DialogTitle>

      <DialogContent dividers>
        <Typography gutterBottom>
          {`Transfert : ${humanize.fileSize(doneSize)} / ${humanize.fileSize(totalSize)}`}
        </Typography>
        <Typography gutterBottom>
          {`Fichiers : ${doneFiles} / ${files.length}`}
        </Typography>

        <List>
          {files.map(file => {
            const Icon = getStatusIcon(file.status);
            const totalSize = humanize.fileSize(file.totalSize);
            const doneSize = humanize.fileSize(file.doneSize);
            const secondary = file.status === 'executing' ? `${doneSize} / ${totalSize}` : totalSize;
            return (
              <ListItem key={file.name}>
                <ListItemIcon>
                  <Icon />
                </ListItemIcon>

                <ListItemText primary={file.name} secondary={secondary} />
              </ListItem>
            );
          })}
        </List>
      </DialogContent>

    </Dialog>
  );
};

export default UploadProgressDialog;

function getStatusIcon(status: FileStatus) {
  switch (status) {
    case 'pending':
      return HourglassEmptyIcon;
    case 'done':
      return CheckIcon;
    case 'executing':
      return PlayArrowIcon;
  }
}

type FileStatus = 'pending' | 'done' | 'executing';

interface DisplayFile extends TransferFileProgress {
  status: FileStatus;
}

function useProgressInfo(progress: TransferFileProgress[]) {
  return useMemo(() => {
    if (!progress) {
      return {
        totalSize: 0,
        doneSize: 0,
        percent: 0,
        doneFiles: 0,
        files: [] as DisplayFile[],
      };
    }

    const totalSize = progress.reduce((acc, file) => acc + file.totalSize, 0);
    const doneSize = progress.reduce((acc, file) => acc + file.doneSize, 0);
    const percent = doneSize / totalSize * 100;
    const doneFiles = progress.filter(file => file.doneSize === file.totalSize).length;
  
    const files = progress.map(file => ({
      ...file,
      status: getStatus(file),
    }));
  
    return {
      totalSize,
      doneSize,
      percent,
      doneFiles,
      files,
    };
  }, [progress]);
}

function getStatus(file: TransferFileProgress): FileStatus {
  if (file.doneSize === 0) {
    return 'pending';
  } else if (file.doneSize === file.totalSize) {
    return 'done';
  } else {
    return 'executing';
  }
}