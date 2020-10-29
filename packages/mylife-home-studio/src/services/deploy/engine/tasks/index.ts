import { TaskMetadata, TaskImplementation } from '../tasks-utils';

import * as ConfigInit from './config-init';
import * as ConfigImport from './config-import';
import * as ConfigHostname from './config-hostname';
import * as ConfigHwaddress from './config-hwaddress';
import * as ConfigWifi from './config-wifi';
import * as ConfigPackage from './config-package';
import * as ConfigDaemon from './config-daemon';
import * as ConfigLs from './config-ls';
import * as ConfigPack from './config-pack';

import * as ImageImport from './image-import';
import * as ImageRemove from './image-remove';
import * as ImageCache from './image-cache';
import * as ImageDeviceTreeOverlay from './image-device-tree-overlay';
import * as ImageDeviceTreeParam from './image-device-tree-param';
import * as ImageCmdlineAdd from './image-cmdline-add';
import * as ImageCmdlineRemove from './image-cmdline-remove';
import * as ImageCoreComponents from './image-core-components';
import * as ImageLs from './image-ls';
import * as ImageInstall from './image-install';
import * as ImageExport from './image-export';
import * as ImageReset from './image-reset';

import * as VariablesSet from './variables-set';
import * as VariablesReset from './variables-reset';

export interface TaskDefinition {
  metadata: TaskMetadata;
  execute: TaskImplementation;
}

const tasks: { [type: string]: TaskDefinition } = {
  ConfigInit,
  ConfigImport,
  ConfigHostname,
  ConfigHwaddress,
  ConfigWifi,
  ConfigPackage,
  ConfigDaemon,
  ConfigLs,
  ConfigPack,
  
  ImageImport,
  ImageRemove,
  ImageCache,
  ImageDeviceTreeOverlay,
  ImageDeviceTreeParam,
  ImageCmdlineAdd,
  ImageCmdlineRemove,
  ImageCoreComponents,
  ImageLs,
  ImageInstall,
  ImageExport,
  ImageReset,
  
  VariablesSet,
  VariablesReset,
};

export default tasks;