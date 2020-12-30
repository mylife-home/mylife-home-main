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
}));

export interface UploadZoneProps {
  className?: string;
  accept?: string;
  multiple?: boolean;
  onUploadFiles: (uploadFiles: File[]) => void;
}

const UploadZone: FunctionComponent<UploadZoneProps> = ({ className, children, onUploadFiles, accept, multiple = false }) => {
  const classes = useStyles();
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ accept, multiple, onDrop: onUploadFiles, noClick: true, noKeyboard: true });
  const rootProps = getRootProps({ className: clsx(isDragActive ? classes.fileDrag : classes.idle, className) });

  return (
    <div {...rootProps}>
      <input {...getInputProps()} />
      {children}
    </div>
  );
};

export default UploadZone;
