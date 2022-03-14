import React, { FunctionComponent } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import { Container, Title } from '../../../lib/main-view-layout';
import { WindowIcon } from '../../../lib/icons';
import { useTabSelector } from '../../../lib/use-tab-selector';
import SplitPane from '../../../lib/split-pane';
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
  const window = useTabSelector((state, tabId) => getWindow(state, tabId, id));

  if (!window) {
    return null;
  }

  return <NotNullWindow id={id} />;
};

export default Window;

const NotNullWindow: FunctionComponent<{ id: string }> = ({ id }) => {
  const classes = useStyles();
  const window = useTabSelector((state, tabId) => getWindow(state, tabId, id));

  return (
    <Container
      title={
        <>
          <Title text={`Fenêtre ${window.id}`} icon={WindowIcon} />

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
