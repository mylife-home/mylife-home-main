import SvgIcon from '@material-ui/core/SvgIcon';

import { InstanceIcon, PluginIcon, ComponentIcon, StateIcon } from '../lib/icons';

export type NodeType = 'instance' | 'plugin' | 'component' | 'state';

export interface Selection {
  type: NodeType;
  id: string;
}

export const ICONS_BY_TYPE: { [type in NodeType]: typeof SvgIcon } = {
  instance: InstanceIcon,
  plugin: PluginIcon,
  component: ComponentIcon,
  state: StateIcon,
};
