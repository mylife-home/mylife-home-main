'use strict';

const fs      = require('fs-extra');
const vfs     = require('../vfs');
const utils   = require('../tasks-utils');

exports.metadata = {
  description : 'setup core components file',
  parameters  : [
    { name : 'file',   description : 'file name to import',              type : 'string' },
    { name : 'flavor', description : 'flavor of mylife-home-core setup', type : 'string', default: '' }
  ]
};

exports.execute = async (context, parameters) => {
  const { file, flavor } = parameters;
  const log              = utils.createLogger(context, 'image:core-components');
  const fullName         = utils.absolutePath(file);
  log.info(`import '${fullName}' as image core components (flavor='${flavor || ''}'`);

  const content = await fs.readFile(fullName, 'utf8');
  vfs.mkdirp(context.root, [ 'mylife-home' ]);
  vfs.writeText(context.root, [ 'mylife-home', `mylife-home-core${flavor ? '-' + flavor : ''}-components.json` ], content);
};