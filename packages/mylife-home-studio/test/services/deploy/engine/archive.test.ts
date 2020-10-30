import { expect } from 'chai';
import path from 'path';
import fs from 'fs-extra';
import * as archive from '../../../../src/services/deploy/engine/archive';
import * as vfs from '../../../../src/services/deploy/engine/vfs';
import { formatStructure } from './utils';

import contentArchiveBase from './content/archive-base';
import contentArchiveConfig from './content/archive-config';

const source = path.resolve(__dirname, '../resources/files/rpi-devel-base.tar.gz');

let cachedBase: vfs.Directory;

async function extractBase() {
  if (cachedBase) {
    return cachedBase;
  }

  const buffer = await fs.readFile(source);
  const target = new vfs.Directory({ missing: true });
  await archive.extract(buffer, target, { baseDirectory: 'mmcblk0p1' });
  cachedBase = target;
  return target;
}

let cachedConfig: vfs.Directory;

async function extractConfig() {
  if (cachedConfig) {
    return cachedConfig;
  }

  const base = await extractBase();

  const target = new vfs.Directory({ missing: true });
  await archive.extract(base.get<vfs.File>('rpi-devel.apkovl.tar.gz').content, target);
  cachedConfig = target;
  return target;
}

describe('Archive', () => {
  it('should extract base', async () => {
    const target = await extractBase();

    expect(formatStructure(target)).to.deep.equal(contentArchiveBase);
  });

  it('should extract config', async () => {
    const target = await extractConfig();

    expect(formatStructure(target)).to.deep.equal(contentArchiveConfig);
  });

  it('should pack then extract folder', async () => {
    const source = await extractConfig();

    const buffer = await archive.pack(source);
    const target = new vfs.Directory();
    await archive.extract(buffer, target);

    expect(formatStructure(target)).to.deep.equal(contentArchiveConfig);
  });
});
