import fs from 'fs-extra';
import { createLogger, absolutePath, TaskImplementation, TaskMetadata } from '../tasks-utils';
import * as vfs from '../vfs';

export const metadata: TaskMetadata = {
  description: 'setup core components file',
  parameters: [
    { name: 'file', description: 'file name to import', type: 'string' },
    { name: 'flavor', description: 'flavor of mylife-home-core setup', type: 'string', default: '' },
  ],
};

export const execute: TaskImplementation = async (context, parameters) => {
  const { file, flavor } = parameters;
  const log = createLogger(context, 'image:core-components');
  const fullName = absolutePath(file);
  log.info(`import '${fullName}' as image core components (flavor='${flavor || ''}'`);

  const content = await fs.readFile(fullName, 'utf8');
  vfs.mkdirp(context.root, ['mylife-home']);
  vfs.writeText(context.root, ['mylife-home', `mylife-home-core${flavor ? '-' + flavor : ''}-components.json`], content);
};
