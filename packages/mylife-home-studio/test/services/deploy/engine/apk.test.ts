import { expect } from 'chai';
import * as apk from '../../../../src/services/deploy/engine/apk';

const repo1 = 'http://dl-4.alpinelinux.org/alpine/v3.13/main/';
const repo2 = 'http://dl-4.alpinelinux.org/alpine/v3.13/community/';

let cachedDatabase: apk.Database;

async function getDatabase() {
  if (cachedDatabase) {
    return cachedDatabase;
  }

  const database = new apk.Database('armhf');
  await database.addRepository(repo1);
  database.index();
  cachedDatabase = database;
  return database;
}

const nodejsPackage = {
  repo: 'http://dl-4.alpinelinux.org/alpine/v3.13/main',
  raw: 'C:Q1x127JfzgG7iyW5uSUzFQLhp3W8g=\n' +
    'P:nodejs\n' +
    'V:14.18.1-r0\n' +
    'A:armhf\n' +
    'S:12616948\n' +
    'I:32882688\n' +
    'T:JavaScript runtime built on V8 engine - LTS version\n' +
    'U:https://nodejs.org/\n' +
    'L:MIT\n' +
    'o:nodejs\n' +
    'm:Jakub Jirutka <jakub@jirutka.cz>\n' +
    't:1634120818\n' +
    'c:242aead8f68a5971ade2d22ce507305ec4ad462b\n' +
    'D:ca-certificates nghttp2-libs>=1.41 so:libbrotlidec.so.1 so:libbrotlienc.so.1 so:libc.musl-armhf.so.1 so:libcares.so.2 so:libcrypto.so.1.1 so:libgcc_s.so.1 so:libnghttp2.so.14 so:libssl.so.1.1 so:libstdc++.so.6 so:libz.so.1\n' +
    'p:nodejs-lts=14.18.1 cmd:node\n' +
    '\n',
  name: 'nodejs',
  version: '14.18.1-r0',
  architecture: 'armhf',
  csum: Buffer.from([0xc7, 0x5d, 0xbb, 0x25, 0xfc, 0xe0, 0x1b, 0xb8, 0xb2, 0x5b, 0x9b, 0x92, 0x53, 0x31, 0x50, 0x2e, 0x1a, 0x77, 0x5b, 0xc8]),
  dependencies: {
    'ca-certificates': '*',
    'nghttp2-libs': '*',
    'so:libbrotlidec.so.1': '*',
    'so:libbrotlienc.so.1': '*',
    'so:libc.musl-armhf.so.1': '*',
    'so:libcares.so.2': '*',
    'so:libcrypto.so.1.1': '*',
    'so:libgcc_s.so.1': '*',
    'so:libnghttp2.so.14': '*',
    'so:libssl.so.1.1': '*',
    'so:libstdc++.so.6': '*',
    'so:libz.so.1': '*'
  },
  provides: { nodejs: '14.18.1-r0', 'nodejs-lts': '14.18.1', 'cmd:node': '*' },
  size: 12616948
};

describe('APK', () => {
  it('should get database', async () => {
    const database = await getDatabase();
    expect(database.list().length).to.equal(4652);
    expect(database.getByName('nodejs')).to.deep.equal(nodejsPackage);
  });

  it('should download multiple repositories', async () => {
    const database = new apk.Database('armhf');
    await database.addRepository(repo2);
    await database.addRepository(repo1);
    database.index();
    expect(database.list().length).to.equal(12257);
    expect(database.getByName('nodejs')).to.deep.equal(nodejsPackage);

    console.log(database.getByProvide('nodejs'));

    expect(database.getByProvide('nodejs').map((p) => ({ name: p.name, version: p.version }))).to.deep.equal([
      { name: 'nodejs-current', version: '15.10.0-r0' },
      { name: 'nodejs', version: '14.18.1-r0' },
    ]);

    expect(database.getByProvide('cmd:node').map((p) => ({ name: p.name, version: p.version }))).to.deep.equal([
      { name: 'nodejs-current', version: '15.10.0-r0' },
      { name: 'nodejs', version: '14.18.1-r0' },
    ]);

    expect(database.getByProvide('lirc').map((p) => ({ name: p.name, version: p.version }))).to.deep.equal([
      { name: 'lirc', version: '0.10.1-r0' },
    ]);
  });

  it('should get package install list', async () => {
    const database = await getDatabase();

    const installList = new apk.InstallList(database);
    installList.addPackage('nodejs');

    const packages = installList.list().map((it) => it.name + '-' + it.version);
    console.log(packages)
    expect(packages).to.deep.equal([
      'nodejs-14.18.1-r0',
      'ca-certificates-20191127-r5',
      'busybox-1.32.1-r6',
      'musl-1.2.2-r1',
      'libcrypto1.1-1.1.1l-r0',
      'nghttp2-libs-1.42.0-r1',
      'brotli-libs-1.0.9-r3',
      'c-ares-1.17.2-r0',
      'libgcc-10.2.1_pre1-r3',
      'libssl1.1-1.1.1l-r0',
      'libstdc++-10.2.1_pre1-r3',
      'zlib-1.2.11-r3'
    ]);
  });
});
