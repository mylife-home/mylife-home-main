'use strict';

const utils = require('../tasks-utils');

exports.metadata = {
  description : 'add a dtoverlay line in image usercfg.txt ( https://www.raspberrypi.org/documentation/configuration/device-tree.md )',
  parameters  : [
    { name : 'content', description: 'overlay data to add', type: 'string' }
  ]
};

exports.execute = async (context, parameters) => {
  const { content } = parameters;
  const log = utils.createLogger(context, 'image:dtoverlay');
  const row = `dtoverlay=${content}`;
  log.info(`append usercfg.txt : '${row}'`);
  utils.fileAppendLine(context.root, [ 'usercfg.txt' ], row);
};
