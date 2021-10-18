import { createLogger, TaskImplementation, TaskMetadata } from '../engine/tasks-utils';
import * as vfs from '../engine/vfs';
import * as apk from '../engine/apk';
import { ExecutionContext } from '../recipe';

export const metadata: TaskMetadata = {
  description: 'setup package cache of the image, from /etc/apk/repositories and /etc/apk/world in config (equivalent of apk cache sync in some way)',
  parameters: [
    { name: 'arch', description: 'Target architecture', type: 'string' },
  ],
};

export const execute: TaskImplementation = async (context, parameters) => {
  const { arch } = parameters;
  const log = createLogger(context, 'image:cache');
  let repositories = readConfigFileLines(context, ['etc', 'apk', 'repositories']);
  const packages = readConfigFileLines(context, ['etc', 'apk', 'world']);

  log.info(`setup image cache for arch '${arch}'`);

  // filter out comments and local path (might cause to add packages that already exists in the local apk repo :/ )
  repositories = repositories.filter((rep) => rep[0] !== '#');
  log.debug(`repositories: ${repositories.join(', ')}`);

  // meta packages are not supported for now
  const meta = packages.filter((pack) => pack[0] === '.');
  if (meta.length) {
    throw new Error(`Meta packages are not supported now : ${meta.join(', ')}`);
  }
  log.debug(`packages: ${packages.join(', ')}`);

  const database = new apk.Database(arch);
  for (const repo of repositories) {
    const localPrefix = '/media/mmcblk0p1';
    if (repo.startsWith(localPrefix)) {
      // local repo
      const localRepo = repo.substring(localPrefix.length);
      log.debug(`Adding local repository '${localRepo}'`);
      await database.addLocalRepository(context.root, localRepo);
      continue;
    }

    log.debug(`Adding repository '${repo}'`);
    await database.addRepository(repo);
  }

  database.index();

  const installList = new apk.InstallList(database);
  for (const pack of packages) {
    installList.addPackage(pack);
  }

  const cacheDirectory = vfs.mkdirp(context.root, ['cache']);
  cacheDirectory.clear();

  for (const pack of installList.list()) {
    log.debug(`download package : '${pack.name}-${pack.version} (size=${pack.size})'`);
  }

  await installList.download(cacheDirectory);
  installList.dumpIndexes(cacheDirectory);

  // write empty 'installed' (no meta packages)
  vfs.writeText(context.root, ['cache', 'installed'], '');
};

function readConfigFileLines(context: ExecutionContext, nodes: string[]) {
  const content = vfs.readText(context.config, nodes);
  return content
    .split('\n')
    .filter((line) => line)
    .map((line) => line.trim());
}
