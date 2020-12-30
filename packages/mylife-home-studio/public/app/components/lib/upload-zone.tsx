import React, { FunctionComponent } from 'react';
import { useDropzone } from 'react-dropzone';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  idle: {
    border: `2px solid transparent`,
  },
  fileDrag: {
    border: `2px solid ${theme.palette.primary.main}`,
  },
  fileDragError: {
    border: `2px solid ${theme.palette.error.main}`,
  },
}));

export interface UploadZoneProps {
  className?: string;
  accept?: string;
  multiple?: boolean;
  onUploadFiles: (uploadFiles: File[]) => void;
}

const UploadZone: FunctionComponent<UploadZoneProps> = ({ className, children, onUploadFiles, accept, multiple = false }) => {
  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({ accept, multiple, onDrop: onUploadFiles, noClick: true, noKeyboard: true });
  const rootClasses = useRootClasses(isDragActive, isDragReject);
  const rootProps = getRootProps({ className: clsx(rootClasses, className) });

  return (
    <div {...rootProps}>
      <input {...getInputProps()} />
      {children}
    </div>
  );
};

export default UploadZone;

function useRootClasses(isDragActive: boolean, isDragReject: boolean) {
  const classes = useStyles();

  if (!isDragActive) {
    return classes.idle;
  }

  return isDragReject ? classes.fileDragError : classes.fileDrag;
}