import { createLogger, TaskImplementation, TaskMetadata } from '../engine/tasks-utils';
import * as vfs from '../engine/vfs';

export const metadata: TaskMetadata = {
  description: 'set the hardware address of a network interface',
  parameters: [
    { name: 'iface', description: 'network interface name (eg: eth0)', type: 'string' },
    { name: 'address', description: 'mac address to set (eg: 11:22:33:44:55:66)', type: 'string' },
  ],
};

export const execute: TaskImplementation = async (context, parameters) => {
  const { iface, address } = parameters;
  const log = createLogger(context, 'config:hwaddress');
  log.info(`set address to '${address}' for interface '${iface}'`);
  log.debug('config: update /etc/networkinterfaces');
  const lines = vfs.readText(context.config, ['etc', 'network', 'interfaces']).split('\n');

  const index = lines.findIndex((row) => row.trim().startsWith(`iface ${iface}`));
  if (index === -1) {
    throw new Error(`Interface ${iface} not found in configuration`);
  }
  lines.splice(index + 1, 0, `\thwaddress ether ${address}`);

  vfs.writeText(context.config, ['etc', 'network', 'interfaces'], lines.join('\n'));
};
