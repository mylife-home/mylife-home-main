import React, { FunctionComponent, useMemo } from 'react';
import { useSelector } from 'react-redux';
import humanize from 'humanize-plus';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import Typography from '@material-ui/core/Typography';

import { getDownloadFileProgress } from '../../../store/deploy/selectors';
import { TransferFileProgress } from '../../../store/deploy/types';

const DownloadProgressDialog: FunctionComponent = () => {
  const progress = useSelector(getDownloadFileProgress);
  const open = !!progress;
  const { name, totalSize, doneSize, percent } = useProgressInfo(progress);

  return (
    <Dialog aria-labelledby="dialog-title" open={open} scroll="paper" maxWidth="sm" fullWidth>
      <DialogTitle id="dialog-title">{`Téléchargement '${name}' en cours (${percent.toFixed()} %)`}</DialogTitle>

      <DialogContent dividers>
        <Typography gutterBottom>
          {`Transfert : ${humanize.fileSize(doneSize)} / ${humanize.fileSize(totalSize)}`}
        </Typography>
      </DialogContent>

    </Dialog>
  );
};

export default DownloadProgressDialog;

function useProgressInfo(progress: TransferFileProgress) {
  return useMemo(() => {
    if (!progress) {
      return {
        name: '',
        totalSize: 0,
        doneSize: 0,
        percent: 0,
      };
    }

    const percent = progress.doneSize / progress.totalSize * 100;
    return { ...progress, percent };
  }, [progress]);
}
