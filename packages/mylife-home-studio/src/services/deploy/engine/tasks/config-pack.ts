'use strict';

const archive = require('../archive');
const utils   = require('../tasks-utils');

exports.metadata = {
  description : 'pack the config into the root fs',
  parameters  : []
};

exports.execute = async (context/*, parameters*/) => {
  const log = utils.createLogger(context, 'config:pack');
  const configFile   = context.root.list().find(node => node.name.endsWith('.apkovl.tar.gz'));
  log.info(`pack config into image file '${configFile.name}'`);
  configFile.content = await archive.pack(context.config);
};