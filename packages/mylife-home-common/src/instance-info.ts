import os from 'os';
import * as buildInfo from './build-info';
import { getDefine } from './tools/defines';
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

export type ListenerCallback = (newData: InstanceInfo) => void;

let instanceInfo: InstanceInfo;
const listeners = new Map<object, ListenerCallback>();

export function init() {
  instanceInfo = create();
}

export function get() {
  return instanceInfo;
}

export function listenUpdates(onUpdate: ListenerCallback): () => void {
  const key = {};

  listeners.set(key, onUpdate);

  return () => {
    listeners.delete(key);
  };
}

function update(newData: InstanceInfo) {
  instanceInfo = newData;

  for (const listener of listeners.values()) {
    listener(newData);
  }
}

export function addComponent(componentName: string) {
  const newData = { ...instanceInfo };
  newData.versions = { ...instanceInfo.versions };

  addComponentVersion(newData.versions, componentName);

  update(newData);
}

export function addCapability(capability: string) {
  const newData = { ...instanceInfo };
  newData.capabilities = [...instanceInfo.capabilities];
  newData.capabilities.push(capability);

  update(newData);
}

function create() {
  const mainComponent = getDefine<string>('main-component');

  const data: InstanceInfo = {
    type: mainComponent,
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

  addComponentVersion(versions, 'common');
  addComponentVersion(versions, mainComponent);

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

function addComponentVersion(versions: { [component: string]: string }, componentName: string) {
  const name = `mylife-home-${componentName}`;
  const info = buildInfo.getInfo().modules[name];
  const version = info?.version || '<unknown>';
  versions[name] = version;
}
