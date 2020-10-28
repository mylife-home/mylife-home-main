'use strict';

const utils = require('../tasks-utils');

exports.metadata = {
  description : 'print the content of a directory from the root fs',
  parameters  : [
    { name : 'path', description: 'path to directory to list', type: 'string' }
  ]
};

exports.execute = async (context, parameters) => {
  const { path } = parameters;
  const log = utils.createLogger(context, 'image:ls');
  log.debug(`content of directory '${path}' from image`);

  utils.directoryLs(log, context.root, path);
};