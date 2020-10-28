'use strict';

const utils = require('../tasks-utils');

exports.metadata = {
  description : 'add a package to be installed',
  parameters  : [
    { name : 'name', description: 'package name', type: 'string' }
  ]
};

exports.execute = async (context, parameters) => {
  const { name } = parameters;
  const log = utils.createLogger(context, 'config:package');
  log.info(`add package '${name}'`);
  utils.configAddPackage(log, context, name);
};
