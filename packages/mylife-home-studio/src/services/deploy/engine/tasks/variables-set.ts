'use strict';

const utils = require('../tasks-utils');

exports.metadata = {
  description : 'set a variable to a value',
  parameters  : [
    { name : 'name', description: 'variable name', type: 'string' },
    { name : 'value', description: 'variable value', type: 'string' }
  ]
};

exports.execute = async (context, parameters) => {
  const log = utils.createLogger(context, 'variables:set');
  const { name, value } = parameters;
  log.info(`${name} = ${value}`);
  context.variables = context.variables || {};
  context.variables[name] = value;
};