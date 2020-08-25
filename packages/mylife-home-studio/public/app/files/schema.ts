import rawHWGarden1 from './content/hw_rpi-home-garden1.json';
import rawHWSockets1 from './content/hw_rpi-home-sockets1.json';
import rawHWGarden4 from './content/hw_rpi0-home-garden4.json';
import rawHWCore from './content/hw_rpi2-home-core.json';
import rawHWEPanel1 from './content/hw_rpi2-home-epanel1.json';
import rawHWEPanel2 from './content/hw_rpi2-home-epanel2.json';
import rawHWGarden2 from './content/hw_rpi2-home-garden2.json';
import rawHWHallbox from './content/hw_rpi2-home-hallbox.json';
import rawVPanelCore from './content/vpanel_rpi2-home-core.json';

export const hwGarden1 = processFile(rawHWGarden1);
export const hwSockets1 = processFile(rawHWSockets1);
export const hwGarden4 = processFile(rawHWGarden4);
export const hwCore = processFile(rawHWCore);
export const hwEPanel1 = processFile(rawHWEPanel1);
export const hwEPanel2 = processFile(rawHWEPanel2);
export const hwGarden2 = processFile(rawHWGarden2);
export const hwHallbox = processFile(rawHWHallbox);
export const vpanelCore = processFile(rawVPanelCore);

function processFile(file: File) {
  return file;
}

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