import { createLogger, TaskImplementation, TaskMetadata } from '../engine/tasks-utils';
import * as vfs from '../engine/vfs';

export const metadata: TaskMetadata = {
  description: 'add a daemon process to be started at a runlevel',
  parameters: [
    { name: 'name', description: 'daemon name', type: 'string' },
    { name: 'runlevel', description: 'runlevel', type: 'string', default: 'default' },
  ],
};

export const execute: TaskImplementation = async (context, parameters) => {
  const { name, runlevel } = parameters;
  const log = createLogger(context, 'config:daemon');
  log.info(`create daemon ${name} at runlevel ${runlevel}`);

  const dir = vfs.path(context.config, ['etc', 'runlevels', runlevel]) as vfs.Directory;
  const symlink = new vfs.Symlink({ name, target: `/etc/init.d/${name}` });
  log.debug(`config: create symlink '/etc/runlevels/${runlevel}/${name}' with target '/etc/init.d/${name}'`);
  dir.add(symlink);
};
