'use strict';

const utils = require('../tasks-utils');

exports.metadata = {
  description : 'reset image data (root fs, config, image)',
  parameters  : []
};

exports.execute = async (context/*, parameters*/) => {
  const log = utils.createLogger(context, 'image:reset');
  log.info('image reset');
  context.root = null;
  context.config = null;
};