import React, { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';

import { useTabPanelId } from '../lib/tab-panel';
import StartPage from '../start-page';
import CoreDesigner from '../core-designer';
import UiDesigner from '../ui-designer';
import OnlineComponentsView from '../online-components-view';
import OnlineHistory from '../online-history';
import OnlineInstancesView from '../online-instances-view';
import OnlineLogs from '../online-logs';
import Deploy from '../deploy';

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
    case TabType.ONLINE_COMPONENTS_VIEW:
      return (<OnlineComponentsView />);
    case TabType.ONLINE_HISTORY:
      return (<OnlineHistory />);
    case TabType.ONLINE_INSTANCES_VIEW:
      return (<OnlineInstancesView />);
    case TabType.ONLINE_LOGS:
      return (<OnlineLogs />);
    case TabType.DEPLOY:
      return (<Deploy />);
  }
};

export default Panel;
