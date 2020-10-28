'use strict';

const utils = require('../tasks-utils');

exports.metadata = {
  description : 'add a parameter to cmdline.txt',
  parameters  : [
    { name : 'content', description: 'parameter data to add', type: 'string' }
  ]
};

exports.execute = async (context, parameters) => {
  const { content } = parameters;
  const log = utils.createLogger(context, 'image:cmdline-add');
  const data = ' ' + content;
  log.info(`append cmdline.txt : '${data}'`);

  utils.singleRowFileUpdate(context.root, [ 'cmdline.txt' ], file => file + data);
};
