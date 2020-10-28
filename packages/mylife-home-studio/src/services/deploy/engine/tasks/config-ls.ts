'use strict';

const utils = require('../tasks-utils');

exports.metadata = {
  description : 'print the content of a directory from the config fs',
  parameters  : [
    { name : 'path', description: 'path to directory to list', type: 'string' }
  ]
};

exports.execute = async (context, parameters) => {
  const { path } = parameters;
  const log = utils.createLogger(context, 'config:ls');
  log.debug(`content of directory '${path}' from config`);

  utils.directoryLs(log, context.config, path);
};