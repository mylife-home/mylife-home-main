import React, { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';

import { useTabPanelId } from '../lib/tab-panel';
import StartPage from '../start-page';
import CoreDesigner from '../core-designer';
import UiDesigner from '../ui-designer';
import OnlineView from '../online-view';
import DeployManager from '../deploy-manager';

import { AppState } from '../../store/types';
import { TabType } from '../../store/tabs/types';
import { getTab } from '../../store/tabs/selectors';

const Panel: FunctionComponent = () => {
  const tabId = useTabPanelId();
  const tab = useSelector((state: AppState) => getTab(state, tabId));

  switch(tab.type) {
    case TabType.START_PAGE:
      return (<StartPage />);
    case TabType.CORE_DESIGNER:
      return (<CoreDesigner />);
    case TabType.UI_DESIGNER:
      return (<UiDesigner />);
    case TabType.ONLINE_VIEW:
      return (<OnlineView />);
    case TabType.DEPLOY_MANAGER:
      return (<DeployManager />);
    }
};

export default Panel;
