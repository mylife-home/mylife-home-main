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

function processFile(file: raw.File) {
  return file;
}

namespace raw {
  export interface File {
    readonly Name: string;
    readonly CreationDate: string;
    readonly LastUpdate: string;
    readonly Components: ComponentContainer[];
    readonly Toolbox: ToolboxItem[];
  }
  
  export interface ComponentContainer {
    readonly EntityName: string;
    readonly Component: Component;
  }
  
  export interface Component {
    readonly id: string;
    readonly library: string;
    readonly type: string;
    readonly bindings: ComponentBinding[];
    readonly config: ComponentConfig[];
    readonly designer: ComponentDesigner[];
  }
  
  export interface ComponentBinding {
    readonly local_action: string;
    readonly remote_attribute: string;
    readonly remote_id: string;
  }
  
  export interface ComponentConfig {
    readonly Key: string;
    readonly Value: string;
  }
  
  export interface ComponentDesigner {
    readonly Key: string;
    readonly Value: string;
  }
  
  export interface ToolboxItem {
    readonly EntityName: string;
    readonly Plugins: Plugin[];
  }
  
  export interface Plugin {
    readonly clazz: string;
    readonly config: string;
    readonly library: string;
    readonly type: string;
    readonly usage: number;
    readonly version: string;
  }
}
