import garden1 from './content/hw_rpi-home-garden1.json';

import core from './content/vpanel_rpi2-home-core.json';

console.log(core);

interface File {
  readonly Name: string;
  readonly CreationDate: string;
  readonly LastUpdate: string;
  readonly Components: RawComponentContainer[];
  readonly Toolbox: RawToolboxItem[];
}

interface RawComponentContainer {
  readonly EntityName: string;
  readonly Component: RawComponent;
}

interface RawComponent {
  readonly id: string;
  readonly library: string;
  readonly type: string;
  readonly bindings: RawComponentBinding[];
  readonly config: RawComponentConfig[];
  readonly designer: RawComponentDesigner[];
}

interface RawComponentBinding {
  readonly local_action: string;
  readonly remote_attribute: string;
  readonly remote_id: string;
}

interface RawComponentConfig {
  readonly Key: string;
  readonly Value: string;
}

interface RawComponentDesigner {
  readonly Key: string;
  readonly Value: string;
}

interface RawToolboxItem {
  readonly EntityName: string;
  readonly Plugins: RawPlugin[];
}

interface RawPlugin {
  readonly clazz: string;
  readonly config: string;
  readonly library: string;
  readonly type: string;
  readonly usage: number;
  readonly version: string;
}