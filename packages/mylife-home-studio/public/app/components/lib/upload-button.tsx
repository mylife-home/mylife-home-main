import React, { ReactNode, useRef, forwardRef } from 'react';
import IconButton from '@material-ui/core/IconButton';

export interface UploadButtonProps {
  className?: string;
  accept?: string;
  multiple?: boolean;
  onUploadFiles: (uploadFiles: File[]) => void;
  children: ReactNode;
}

const UploadButton = forwardRef<HTMLButtonElement, UploadButtonProps>(({ className, children, accept, multiple, onUploadFiles }, ref) => {
  const inputRef = useRef<HTMLInputElement>();

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files);
    onUploadFiles(files);
  };

  return (
    <>
      <input ref={inputRef} type="file" accept={accept} hidden multiple={multiple} onChange={handleUpload} />

      <IconButton ref={ref} className={className} onClick={() => inputRef.current.click()}>
        {children}
      </IconButton>
    </>
  );
});

export default UploadButton;