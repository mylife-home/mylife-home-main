'use strict';

const vfs   = require('../vfs');
const apk   = require('../apk');
const utils = require('../tasks-utils');

exports.metadata = {
  description : 'setup package cache of the image, from /etc/apk/repositories and /etc/apk/world in config (equivalent of apk cache sync in some way)',
  parameters  : []
};

function readConfigFileLines(context, nodes) {
  const content = vfs.readText(context.config, nodes);
  return content.split('\n').filter(line => line).map(line => line.trim());
}

exports.execute = async (context/*, parameters*/) => {
  const log = utils.createLogger(context, 'image:cache');
  let repositories = readConfigFileLines(context, [ 'etc', 'apk', 'repositories' ]);
  let packages     = readConfigFileLines(context, [ 'etc', 'apk', 'world' ]);

  log.info('setup image cache');

  // filter out comments and local path (might cause to add packages that already exists in the local apk repo :/ )
  repositories = repositories.filter(rep => rep[0] !== '#' );
  log.debug(`repositories: ${repositories.join(', ')}`);

  // meta packages are not supported for now
  const meta = packages.filter(pack => pack[0] === '.');
  if(meta.length) {
    throw new Error(`Meta packages are not supported now : ${meta.join(', ')}`);
  }
  log.debug(`packages: ${packages.join(', ')}`);

  const database = new apk.Database();
  for(const repo of repositories) {

    const localPrefix = '/media/mmcblk0p1';
    if(repo.startsWith(localPrefix)) {
      // local repo
      await database.addLocalRepository(context.root, repo.substring(localPrefix.length));
      continue;
    }

    await database.addRepository(repo);
  }

  database.index();

  const installList = new apk.InstallList(database);
  for(const pack of packages) {
    installList.addPackage(pack);
  }

  const cacheDirectory = vfs.mkdirp(context.root, [ 'cache' ]);
  cacheDirectory.clear();

  for(const pack of installList.list()) {
    log.debug(`download package : '${pack.name}-${pack.version} (size=${pack.size})'`);
  }

  await installList.download(cacheDirectory);
  installList.dumpIndexes(cacheDirectory);

  // write empty 'installed' (no meta packages)
  vfs.writeText(context.root, [ 'cache', 'installed' ], '');
};
