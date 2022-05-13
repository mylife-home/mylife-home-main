import React, { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';

import { Container, Title } from '../../../lib/main-view-layout';
import { WindowIcon, TemplateIcon } from '../../../lib/icons';
import SplitPane from '../../../lib/split-pane';
import { AppState } from '../../../../store/types';
import { getWindow, getTemplate } from '../../../../store/ui-designer/selectors';
import { WindowActions } from '../common/window-actions';
import { TemplateActions } from '../common/template-actions';
import { ViewStateProvider } from './view-state';
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

export const Window: FunctionComponent<{ id: string }> = ({ id }) => {
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
        <ViewStateProvider viewType='window' viewId={id}>
          <SplitPane split="vertical" defaultSize={450} minSize={300} primary="second">
            <Canvas />
            <Toolbox />
          </SplitPane>
        </ViewStateProvider>
      </SnapContextProvider>
    </Container>
  );
};

export const Template: FunctionComponent<{ id: string }> = ({ id }) => {
  const classes = useStyles();
  const template = useSelector((state: AppState) => getTemplate(state, id));

  return (
    <Container
      title={
        <>
          <Title text={`Template ${template.templateId}`} icon={TemplateIcon} />

          <div className={classes.titleActions}>
            <TemplateActions id={id} />
          </div>
        </>
      }
    >
      <SnapContextProvider>
        <ViewStateProvider viewType='template' viewId={id}>
          <SplitPane split="vertical" defaultSize={450} minSize={300} primary="second">
            <Canvas />
            <Toolbox />
          </SplitPane>
        </ViewStateProvider>
      </SnapContextProvider>
    </Container>
  );
};
