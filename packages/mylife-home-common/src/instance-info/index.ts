import os from 'os';
import * as pirev from 'pirev';
import * as buildInfo from '../build-info';
import { getDefine } from '../tools/defines';
import { InstanceInfo } from './types';

export { InstanceInfo };

export type ListenerCallback = (newData: InstanceInfo) => void;

let instanceInfo: InstanceInfo;
const listeners = new Map<object, ListenerCallback>();

let refreshTimer: NodeJS.Timeout;

export function init() {
  instanceInfo = create();

  refreshTimer = setInterval(() => update(instanceInfo), 60000);
  refreshTimer.unref();
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
  instanceInfo = {
    ...newData, 
    // use this opportunity to make uptimes up-to-date
    systemUptime: os.uptime(),
    instanceUptime: process.uptime(),
  };

  for (const listener of listeners.values()) {
    listener(newData);
  }

  refreshTimer.refresh();
}

export function addComponent(componentName: string, version: string) {
  const newData = { ...instanceInfo };
  newData.versions = { ...instanceInfo.versions };

  addComponentVersion(newData.versions, componentName, version);

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
    systemUptime: os.uptime(),
    instanceUptime: process.uptime(),
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

function getHardwareInfo() {
  const hardware: { [name: string]: string } = {};

  try {
    const { revision, model, cpus } = pirev.getInfoSync();
    hardware.main = model;
    hardware.processor = `${revision.processor} - ${cpus.length} cores`;
    hardware.memory = revision.memory;
    hardware.manufacturer = revision.manufacturer;
  } catch {
    // not a rpi
    hardware.main = os.arch();
  }

  return hardware;
}

function addComponentVersion(versions: { [component: string]: string; }, componentName: string, version?: string) {
  const name = `mylife-home-${componentName}`;
  if (!version) {
    const info = buildInfo.getInfo().modules[name];
    version = info?.version || '<unknown>';
  }
  
  versions[name] = version;
}
