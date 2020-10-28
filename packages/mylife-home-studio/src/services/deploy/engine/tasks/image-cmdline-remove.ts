'use strict';

const utils = require('../tasks-utils');

exports.metadata = {
  description : 'remove a parameter from cmdline.txt',
  parameters  : [
    { name : 'content', description: 'parameter data to search and remove', type: 'string' }
  ]
};

exports.execute = async (context, parameters) => {
  const { content } = parameters;
  const log = utils.createLogger(context, 'image:cmdline-remove');
  log.info(`remove in cmdline.txt : '${content}'`);

  utils.singleRowFileUpdate(context.root, [ 'cmdline.txt' ], file => file.split(' ').filter(it => it !== content).join(' '));
};
