import os from 'os';
import { getDefine } from './defines';

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

function uptimeToBoottime(uptime: number) {
  return Date.now() - Math.round(os.uptime() * 1000);
}

function createInstanceInfo() {
  const data: InstanceInfo = {
    type: getDefine<string>('mainComponent'),
    hardware: 'TODO pirev',
    versions: {},
    systemBootTime: uptimeToBoottime(os.uptime()),
    instanceBootTime: uptimeToBoottime(process.uptime()),
    hostname: os.hostname(),
    capabilities: []
  };

  // TODO versions

  return data;
}


/*
pirev

ReferenceError: No revision code found

  revision: {
    type: '2B',
    memory: '1GB',
    processor: 'BCM2836',
    revision: 1.1,
    manufacturer: 'Embest',
    overvoltage: true,
    otp: { program: true, read: true },
    warranty: true,
    code: 'a21041'
  }
*/