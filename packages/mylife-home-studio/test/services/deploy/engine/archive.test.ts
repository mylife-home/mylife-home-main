'use strict';

const { expect }          = require('chai');
const fs                  = require('fs-extra');
const archive             = require('../../lib/engine/archive');
const vfs                 = require('../../lib/engine/vfs');
const { formatStructure } = require('./utils');

const source = '/Users/vincent/Downloads/rpi-devel-base.tar.gz';

let cachedBase;

async function extractBase() {
  if(cachedBase) {
    return cachedBase;
  }

  const buffer = await fs.readFile(source);
  const target = new vfs.Directory({ missing: true });
  await archive.extract(buffer, target, { baseDirectory: 'mmcblk0p1' });
  cachedBase = target;
  return target;
}

let cachedConfig;

async function extractConfig() {
  if(cachedConfig) {
    return cachedConfig;
  }

  const base = await extractBase();

  const target = new vfs.Directory({ missing: true });
  await archive.extract(base.get('rpi-devel.apkovl.tar.gz').content, target);
  cachedConfig = target;
  return target;
}

describe('Archive', () => {

  it('Should extract base', async () => {
    const target = await extractBase();

    expect(formatStructure(target)).to.deep.equal(require('./content/archive-base'));
  });

  it('Should extract config', async () => {
    const target = await extractConfig();

    expect(formatStructure(target)).to.deep.equal(require('./content/archive-config'));
  });

  it('Should pack then extract folder', async () => {
    const source = await extractConfig();

    const buffer = await archive.pack(source);
    const target = new vfs.Directory();
    await archive.extract(buffer, target);

    expect(formatStructure(target)).to.deep.equal(require('./content/archive-config'));
  });
});
