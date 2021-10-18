import { expect } from 'chai';
import * as apk from '../../../../src/services/deploy/engine/apk';

const repo1 = 'http://dl-4.alpinelinux.org/alpine/v3.14/main/';
const repo2 = 'http://dl-4.alpinelinux.org/alpine/v3.14/community/';

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
  repo: 'http://dl-4.alpinelinux.org/alpine/v3.14/main',
  raw: 'C:Q1xvQh9xGQvObR8qaI3rXwKEEmYyQ=\n' +
    'P:nodejs\n' +
    'V:14.18.1-r0\n' +
    'A:armhf\n' +
    'S:12631604\n' +
    'I:32923648\n' +
    'T:JavaScript runtime built on V8 engine - LTS version\n' +
    'U:https://nodejs.org/\n' +
    'L:MIT\n' +
    'o:nodejs\n' +
    'm:Jakub Jirutka <jakub@jirutka.cz>\n' +
    't:1634120665\n' +
    'c:d14dc410d94f444fb2a5efd2c831659c0c2ae579\n' +
    'k:100\n' +
    'D:ca-certificates nghttp2-libs>=1.41 /bin/sh so:libbrotlidec.so.1 so:libbrotlienc.so.1 so:libc.musl-armhf.so.1 so:libcares.so.2 so:libcrypto.so.1.1 so:libgcc_s.so.1 so:libnghttp2.so.14 so:libssl.so.1.1 so:libstdc++.so.6 so:libz.so.1\n' +
    'p:nodejs-lts=14.18.1 cmd:node\n' +
    '\n',
  name: 'nodejs',
  version: '14.18.1-r0',
  architecture: 'armhf',
  csum: Buffer.from([0xc6, 0xf4, 0x21, 0xf7, 0x11, 0x90, 0xbc, 0xe6, 0xd1, 0xf2, 0xa6, 0x88, 0xde, 0xb5, 0xf0, 0x28, 0x41, 0x26, 0x63, 0x24]),
  dependencies: {
    'ca-certificates': '*',
    'nghttp2-libs': '*',
    '/bin/sh': '*',
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
  provides: { nodejs: '14.18.1-r0', 'nodejs-lts': '14.18.1' },
  size: 12631604
};

describe('APK', () => {
  it('should get database', async () => {
    const database = await getDatabase();
    expect(database.list().length).to.equal(4747);
    console.log(database.getByName('nodejs'));
    expect(database.getByName('nodejs')).to.deep.equal(nodejsPackage);
  });

  it('should download multiple repositories', async () => {
    const database = new apk.Database('armhf');
    await database.addRepository(repo2);
    await database.addRepository(repo1);
    database.index();
    expect(database.list().length).to.equal(11161);
    expect(database.getByName('nodejs')).to.deep.equal(nodejsPackage);

    expect(database.getByProvide('nodejs').map((p) => ({ name: p.name, version: p.version }))).to.deep.equal([
      { name: 'nodejs', version: '8.9.3-r1' },
      { name: 'nodejs', version: '6.10.3-r2' },
    ]);
  });

  it('should get package install list', async () => {
    const database = await getDatabase();

    const installList = new apk.InstallList(database);
    installList.addPackage('nodejs');

    const packages = installList.list().map((it) => it.name + '-' + it.version);
    expect(packages).to.deep.equal([
      'nodejs-14.18.1-r0',
      'ca-certificates-20191127-r5',
      'busybox-1.33.1-r3',
      'musl-1.2.2-r3',
      'libcrypto1.1-1.1.1l-r0',
      'nghttp2-libs-1.43.0-r0',
      'brotli-libs-1.0.9-r5',
      'c-ares-1.17.2-r0',
      'libgcc-10.3.1_git20210424-r2',
      'libssl1.1-1.1.1l-r0',
      'libstdc++-10.3.1_git20210424-r2',
      'zlib-1.2.11-r3',
    ]);
  });
});
