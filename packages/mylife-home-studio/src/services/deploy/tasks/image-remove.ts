import { createLogger, TaskImplementation, TaskMetadata } from '../engine/tasks-utils';
import * as vfs from '../engine/vfs';

export const metadata: TaskMetadata = {
  description: 'remove a node (file/directory/symlink) from the root fs',
  parameters: [{ name: 'path', description: 'path to remove name', type: 'string' }],
};

export const execute: TaskImplementation = async (context, parameters) => {
  const { path } = parameters;
  const log = createLogger(context, 'image:remove');
  log.info(`remove file '${path}' from image`);

  const nodes = path.split('/').filter((node: string) => node);
  const dir = vfs.path(context.root, nodes.slice(0, nodes.length - 1)) as vfs.Directory;
  const node = dir.get(nodes[nodes.length - 1]);
  if (!node) {
    log.warning(`file '${nodes[nodes.length - 1]}' not found in folder '/${nodes.slice(0, nodes.length - 1).join('/')}'`);
    return;
  }
  dir.delete(node);
};
