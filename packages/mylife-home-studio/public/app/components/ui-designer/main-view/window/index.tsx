import React, { FunctionComponent } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Divider from '@material-ui/core/Divider';

import { Container, Title } from '../../../lib/main-view-layout';
import { WindowIcon } from '../../../lib/icons';
import { useTabSelector } from '../../../lib/use-tab-selector';
import { getWindow } from '../../../../store/ui-designer/selectors';
import { useResetSelectionIfNull } from '../../selection';
import DeleteButton from '../../../lib/delete-button';
import { WindowStateProvider } from './window-state';
import CanvasWindow from './canvas-window';
import Toolbox from './toolbox';

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
  canvas: {
    flex: 1,
  },
  toolbox: {
    width: 300,
  },
}));

const Window: FunctionComponent<{ id: string }> = ({ id }) => {
  const classes = useStyles();
  const window = useTabSelector((state, tabId) => getWindow(state, tabId, id));

  // handle window that becomes null (after deletion)
  useResetSelectionIfNull(window);

  if (!window) {
    return null;
  }

  const onDelete = () => {
    console.log('TODO: delete');
  };

  return (
    <Container
      title={
        <>
          <Title text={`Fenêtre ${window.id}`} icon={WindowIcon} />
          <DeleteButton icon tooltip="Supprimer la fenêtre" onConfirmed={onDelete} />
          TODO: checkbox for grid + custom size + stick positions/sizes
        </>
      }
    >
      <WindowStateProvider id={id}>
        <div className={classes.wrapper}>
          <CanvasWindow className={classes.canvas} />
          <Divider orientation="vertical" />
          <Toolbox className={classes.toolbox} />
        </div>
      </WindowStateProvider>
    </Container>
  );
};

export default Window;
