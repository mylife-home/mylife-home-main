import React, { FunctionComponent } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Divider from '@material-ui/core/Divider';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import AddIcon from '@material-ui/icons/Add';
import EditIcon from '@material-ui/icons/Edit';
import FileCopyIcon from '@material-ui/icons/FileCopy';

import { Container, Title } from '../../../lib/main-view-layout';
import { WindowIcon } from '../../../lib/icons';
import { useTabSelector } from '../../../lib/use-tab-selector';
import { getWindow } from '../../../../store/ui-designer/selectors';
import { useResetSelectionIfNull } from '../../selection';
import { useWindowActions } from '../common/window-actions';
import DeleteButton from '../../../lib/delete-button';
import { WindowStateProvider } from './window-state';
import CanvasWindow from './canvas-window';
import Toolbox from './toolbox';
import { SnapContextProvider } from './snap';

const useStyles = makeStyles((theme) => ({
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,

    display: 'flex',
    flexDirection: 'row',
  },
  titleActions: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  canvas: {
    flex: 1,
  },
  toolbox: {
    width: 300,
  },
}));

const Window: FunctionComponent<{ id: string }> = ({ id }) => {
  const window = useTabSelector((state, tabId) => getWindow(state, tabId, id));

  // handle window that becomes null (after deletion)
  useResetSelectionIfNull(window);

  if (!window) {
    return null;
  }

  return <NotNullWindow id={id} />;
};

export default Window;

const NotNullWindow: FunctionComponent<{ id: string }> = ({ id }) => {
  const classes = useStyles();
  const window = useTabSelector((state, tabId) => getWindow(state, tabId, id));
  const { onDuplicate, onRename, onRemove } = useWindowActions(id);

  return (
    <Container
      title={
        <>
          <Title text={`Fenêtre ${window.id}`} icon={WindowIcon} />

          <div className={classes.titleActions}>
            <Tooltip title="Dupliquer la fenêtre">
              <IconButton onClick={onDuplicate}>
                <FileCopyIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title="Renommer la fenêtre">
              <IconButton onClick={onRename}>
                <EditIcon />
              </IconButton>
            </Tooltip>

            <DeleteButton icon tooltip="Supprimer la fenêtre" onConfirmed={onRemove} />
          </div>
        </>
      }
    >
      <SnapContextProvider>
        <WindowStateProvider id={id}>
          <div className={classes.wrapper}>
            <CanvasWindow className={classes.canvas} />
            <Divider orientation="vertical" />
            <Toolbox className={classes.toolbox} />
          </div>
        </WindowStateProvider>
      </SnapContextProvider>
    </Container>
  );
};