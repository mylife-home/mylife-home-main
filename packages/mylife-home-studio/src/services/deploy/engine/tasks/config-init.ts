'use strict';

const vfs     = require('../vfs');
const archive = require('../archive');
const utils   = require('../tasks-utils');

exports.metadata = {
  description : 'Extract the config (.apkovl.tar.gz) from the image to context.config',
  parameters  : []
};

exports.execute = async (context/*, parameters*/) => {
  const configFile = context.root.list().find(node => node.name.endsWith('.apkovl.tar.gz'));
  context.config   = new vfs.Directory({ missing: true });
  const log = utils.createLogger(context, 'config:init');
  log.info(`extract config from image file '${configFile.name}'`);
  await archive.extract(configFile.content, context.config);
};