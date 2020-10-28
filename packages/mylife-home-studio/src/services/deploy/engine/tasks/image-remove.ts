'use strict';

const vfs   = require('../vfs');
const utils = require('../tasks-utils');

exports.metadata = {
  description : 'remove a node (file/directory/symlink) from the root fs',
  parameters  : [
    { name : 'path', description: 'path to remove name', type: 'string' }
  ]
};

exports.execute = async (context, parameters) => {
  const { path } = parameters;
  const log = utils.createLogger(context, 'image:remove');
  log.info(`remove file '${path}' from image`);

  const nodes = path.split('/').filter(n => n);
  const dir   = vfs.path(context.root, nodes.slice(0, nodes.length - 1));
  const node  = dir.get(nodes[nodes.length - 1]);
  if(!node) {
    log.warning(`file '${nodes[nodes.length - 1]}' not found in folder '/${nodes.slice(0, nodes.length - 1).join('/')}'`);
    return;
  }
  dir.delete(node);
};