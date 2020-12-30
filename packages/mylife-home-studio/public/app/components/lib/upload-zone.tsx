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
  onUploadFiles: (uploadFiles: File[]) => void;
}

const UploadZone: FunctionComponent<UploadZoneProps> = ({ className, children, onUploadFiles }) => {
  const classes = useStyles();
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop: onUploadFiles });

  const rootProps = getRootProps({
    className: clsx(isDragActive ? classes.fileDrag : classes.idle, className),
    onClick: e => { e.stopPropagation(); }
  });

  return (
    <div {...rootProps}>
      <input {...getInputProps()} />
      {children}
    </div>
  );
};

export default UploadZone;
