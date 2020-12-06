import { createAction } from '@reduxjs/toolkit';
import { ActionTypes, NewTabAction, MoveTabAction, TabIdAction, ChangeTabTitleAction, TabType, NewTabData } from './types';
import { CoreDesignerNewTabData } from '../core-designer/types';

export const newTab = createAction<NewTabAction>(ActionTypes.NEW);
export const closeTab = createAction<TabIdAction>(ActionTypes.CLOSE);
export const activateTab = createAction<TabIdAction>(ActionTypes.ACTIVATE);
export const moveTab = createAction<MoveTabAction>(ActionTypes.MOVE);
export const changeTabTitle = createAction<ChangeTabTitleAction>(ActionTypes.CHANGE_TITLE);

let idCounter = 0;

export const newCoreDesignerTab = ({title, data} : { title: string, data: CoreDesignerNewTabData }) => newTab({
  id: `core-designer-${++idCounter}`,
  title,
  type: TabType.CORE_DESIGNER,
  closable: true,
  data
});

export const newUiDesignerTab = ({title, data} : { title: string, data: NewTabData }) => newTab({
  id: `core-designer-${++idCounter}`,
  title,
  type: TabType.UI_DESIGNER,
  closable: true,
  data
});

export const newOnlineComponentsViewTab = () => newTab({
  id: `online-components-view-${++idCounter}`,
  title: `Vue des composants`,
  type: TabType.ONLINE_COMPONENTS_VIEW,
  closable: true,
  data: null
});

export const newOnlineHistoryTab = () => newTab({
  id: `online-history-${++idCounter}`,
  title: `Historique`,
  type: TabType.ONLINE_HISTORY,
  closable: true,
  data: null
});

export const newOnlineInstancesViewTab = () => newTab({
  id: `online-instances-view-${++idCounter}`,
  title: `Vue des instances`,
  type: TabType.ONLINE_INSTANCES_VIEW,
  closable: true,
  data: null
});

export const newOnlineLogsTab = () => newTab({
  id: `online-logs-${++idCounter}`,
  title: `Logs`,
  type: TabType.ONLINE_LOGS,
  closable: true,
  data: null
});

export const newDeployTab = () => newTab({
  id: `deploy-${++idCounter}`,
  title: `Déploiement`,
  type: TabType.DEPLOY,
  closable: true,
  data: null
});
