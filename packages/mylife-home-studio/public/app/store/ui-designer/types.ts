import { Table } from '../common/types';
import { NewTabData } from '../tabs/types';

export interface UiDesignerNewTabData extends NewTabData {
  projectId: string;
}

export interface UiOpenedProject {
  id: string; // = tabId
  projectId: string; // TODO: can change, need to update tab title on change
  notifierId: string;
  // TODO
}

export interface UiDesignerState {
  openedProjects: Table<UiOpenedProject>;
}
