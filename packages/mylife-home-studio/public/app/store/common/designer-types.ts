import { NewTabData } from '../tabs/types';
import { Table } from './types';

export interface DesignerNewTabData extends NewTabData {
  projectId: string;
}

export interface OpenedProjectBase {
  id: string; // = tabId
  projectId: string; // TODO: can change, need to update tab title on change
  notifierId: string;
}

export interface DesignerState<OpenedProject extends OpenedProjectBase> {
  openedProjects: Table<OpenedProject>;
}
