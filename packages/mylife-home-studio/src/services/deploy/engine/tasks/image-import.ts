'use strict';

const fs      = require('fs-extra');
const vfs     = require('../vfs');
const archive = require('../archive');
const utils   = require('../tasks-utils');

exports.metadata = {
  description : 'import the specified archive into the root fs of the image',
  parameters  : [
    { name : 'archiveName', description: 'archive name', type: 'string' },
    { name : 'rootPath', description: 'path of the root fs inside the archive', type: 'string', default: '' }
  ]
};

exports.execute = async (context, parameters) => {
  const { archiveName, rootPath } = parameters;
  const fullArchiveName = utils.absolutePath(archiveName);
  const log = utils.createLogger(context, 'image:import');
  log.info(`import '${fullArchiveName}' using root path '${rootPath}' into image`);

  const buffer = await fs.readFile(fullArchiveName);

  context.root = context.root || new vfs.Directory({ missing: true });
  await archive.extract(buffer, context.root, { baseDirectory: rootPath });
};