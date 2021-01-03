import React, { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import { useTabPanelId } from '../../../lib/tab-panel';
import { AppState } from '../../../../store/types';
import { getWindow } from '../../../../store/ui-designer/selectors';
import { useResetSelectionIfNull } from '../../selection';

const Window: FunctionComponent<{ id: string }> = ({ id }) => {
  const tabId = useTabPanelId();
  const window = useSelector((state: AppState) => getWindow(state, tabId, id));

  // handle window that becomes null (after deletion)
  useResetSelectionIfNull(window);

  if (!window) {
    return null;
  }

  return (
    <Box>
      <Typography>Window {window.id}</Typography>
    </Box>
  );
};

export default Window;
