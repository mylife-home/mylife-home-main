import React, { FunctionComponent, useMemo } from 'react';
import { useSelector } from 'react-redux';

import { getUploadFilesProgress } from '../../../store/deploy/selectors';
import { UploadFileProgress } from '../../../store/deploy/types';

const UploadProgressDialog: FunctionComponent = () => {
  const progress = useSelector(getUploadFilesProgress);

  return null;
};

export default UploadProgressDialog;