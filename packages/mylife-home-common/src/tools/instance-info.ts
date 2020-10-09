import os from 'os';
import * as buildInfo from '../build-info';
import { getDefine } from './defines';
import * as pirev from 'pirev';

export interface InstanceInfo {
  /**
   * 'ui' | 'studio' | 'core' | 'driver? (for arduino/esp/...)'
   */
  type: string;

  /**
   * 'rpi-<version>?' | 'arduino-<type?>' | 'esp8266'
   */
  hardware: string;

  /**
   * --- rpi
   * os: linux-xxx
   * node: 24.5
   * mylife-home-core: 1.0.0
   * mylife-home-common: 1.0.0
   * --- esp/arduino
   * program: 1.21.4
   */
  versions: {
    [component: string]: string;
  };

  systemBootTime: number;
  instanceBootTime: number;
  hostname: string;
  capabilities: string[];
}

let instanceInfo: InstanceInfo;

export function getInstanceInfo() {
  if (!instanceInfo) {
    instanceInfo = createInstanceInfo();
  }

  return instanceInfo;
}

function createInstanceInfo() {
  const data: InstanceInfo = {
    type: getDefine<string>('main-component'),
    hardware: getHardwareInfo(),
    versions: {},
    systemBootTime: uptimeToBoottime(os.uptime()),
    instanceBootTime: uptimeToBoottime(process.uptime()),
    hostname: os.hostname(),
    capabilities: [],
  };

  const { versions } = data;

  versions.os = os.version();
  versions.node = process.version;

  for (const [name, { version }] of Object.entries(buildInfo.getInfo().modules)) {
    versions[name] = version;
  }

  return data;
}

function uptimeToBoottime(uptime: number) {
  return Date.now() - Math.round(uptime * 1000);
}

function getHardwareInfo() {
  try {
    const { revision } = pirev.getInfoSync();
    return `raspberry pi ${revision.type} ${revision.revision} (processor=${revision.processor} memory=${revision.memory} manufacturer=${revision.manufacturer})`;
  } catch {
    // not a rpi
    return os.arch();
  }
}
