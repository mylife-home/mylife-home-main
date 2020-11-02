import { config } from 'process';
import { ExecutionContext } from '../recipe';
import { createLogger, Logger, TaskImplementation, TaskMetadata } from '../engine/tasks-utils';
import * as vfs from '../engine/vfs';

export const metadata: TaskMetadata = {
  description: 'set the hostname',
  parameters: [{ name: 'hostname', description: 'host name', type: 'string' }],
};

function replaceHost(log: Logger, context: ExecutionContext, path: string[], oldHost: string, newHost: string) {
  log.debug(`config: replace ${oldHost} to ${newHost} in file '/${path.join('/')}'`);
  let content = vfs.readText(context.config, path);
  content = content.replace(new RegExp(oldHost, 'g'), newHost);
  vfs.writeText(context.config, path, content);
}

export const execute: TaskImplementation = async (context, parameters) => {
  const { hostname } = parameters;
  const log = createLogger(context, 'config:hostname');
  log.info(`set hostname to '${hostname}'`);
  const oldHostname = vfs.readText(context.config, ['etc', 'hostname']).trimRight();
  log.debug(`existing hostname found : '${oldHostname}'`);

  replaceHost(log, context, ['etc', 'hostname'], oldHostname, hostname);
  replaceHost(log, context, ['etc', 'network', 'interfaces'], oldHostname, hostname);
  replaceHost(log, context, ['etc', 'hosts'], oldHostname, hostname);

  const configFile = context.root.list().find((node) => node.name.endsWith('.apkovl.tar.gz'));
  log.debug(`rename image file '${configFile.name}' to '${hostname}.apkovl.tar.gz'`);
  const newConfigFile = new vfs.File({ ...configFile, name: hostname + '.apkovl.tar.gz' });
  context.root.delete(configFile);
  context.root.add(newConfigFile);
};
