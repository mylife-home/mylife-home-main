import { DesignerNewTabData, OpenedProjectBase, DesignerState } from '../common/designer-types';

export { DesignerNewTabData };

export interface UiOpenedProject extends OpenedProjectBase {
  // TODO
}

export type UiDesignerState = DesignerState<UiOpenedProject>;
