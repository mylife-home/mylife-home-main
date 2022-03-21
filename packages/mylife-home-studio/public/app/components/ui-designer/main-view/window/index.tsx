import React, { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';

import { Container, Title } from '../../../lib/main-view-layout';
import { WindowIcon } from '../../../lib/icons';
import SplitPane from '../../../lib/split-pane';
import { AppState } from '../../../../store/types';
import { getWindow } from '../../../../store/ui-designer/selectors';
import { WindowActions } from '../common/window-actions';
import { WindowStateProvider } from './window-state';
import Canvas from './canvas';
import Toolbox from './toolbox';
import { SnapContextProvider } from './snap';

const useStyles = makeStyles((theme) => ({
  titleActions: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
}));

const Window: FunctionComponent<{ id: string }> = ({ id }) => {
  const classes = useStyles();
  const window = useSelector((state: AppState) => getWindow(state, id));

  return (
    <Container
      title={
        <>
          <Title text={`Fenêtre ${window.windowId}`} icon={WindowIcon} />

          <div className={classes.titleActions}>
            <WindowActions id={id} />
          </div>
        </>
      }
    >
      <SnapContextProvider>
        <WindowStateProvider id={id}>
          <SplitPane split="vertical" defaultSize={450} minSize={300} primary="second">
            <Canvas />
            <Toolbox />
          </SplitPane>
        </WindowStateProvider>
      </SnapContextProvider>
    </Container>
  );
};

export default Window;
