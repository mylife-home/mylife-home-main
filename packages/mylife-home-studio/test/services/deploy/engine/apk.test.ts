import { expect } from 'chai';
import * as apk from '../../../../src/services/deploy/engine/apk';

const repo1 = 'http://dl-4.alpinelinux.org/alpine/v3.7/main/';
const repo2 = 'http://dl-4.alpinelinux.org/alpine/v3.6/main/';

let cachedDatabase: apk.Database;

async function getDatabase() {
  if (cachedDatabase) {
    return cachedDatabase;
  }

  const database = new apk.Database();
  await database.addRepository(repo1);
  database.index();
  cachedDatabase = database;
  return database;
}

const nodejsPackage = {
  repo: 'http://dl-4.alpinelinux.org/alpine/v3.7/main',
  raw: 'C:Q1taWtWhX/QRZfpLRjJlvtMbnPCEI=\n' +
    'P:nodejs\n' +
    'V:8.9.3-r1\n' +
    'A:armhf\n' +
    'S:7133998\n' +
    'I:19424256\n' +
    'T:JavaScript runtime built on V8 engine - LTS version\n' +
    'U:https://nodejs.org/\n' +
    'L:MIT\n' +
    'o:nodejs\n' +
    'm:Jakub Jirutka <jakub@jirutka.cz>\n' +
    't:1522619874\n' +
    'c:d4baade662f4bfd0b0ab2a4706520298e35e8683\n' +
    'D:ca-certificates nodejs-npm=8.9.3-r1 so:libc.musl-armhf.so.1 so:libcares.so.2 so:libcrypto.so.1.0.0 so:libgcc_s.so.1 so:libhttp_parser.so.2.7.1 so:libssl.so.1.0.0 so:libstdc++.so.6 so:libuv.so.1 so:libz.so.1\n' +
    'p:nodejs-lts=8.9.3 cmd:node\n' +
    '\n',
  name: 'nodejs',
  version: '8.9.3-r1',
  architecture: 'armhf',
  csum: Buffer.from([0xb5, 0xa5, 0xad, 0x5a, 0x15, 0xff, 0x41, 0x16, 0x5f, 0xa4, 0xb4, 0x63, 0x26, 0x5b, 0xed, 0x31, 0xb9, 0xcf, 0x08, 0x42]),
  dependencies: {
    'ca-certificates': '*',
    'nodejs-npm': '8.9.3-r1',
    'so:libc.musl-armhf.so.1': '*',
    'so:libcares.so.2': '*',
    'so:libcrypto.so.1.0.0': '*',
    'so:libgcc_s.so.1': '*',
    'so:libhttp_parser.so.2.7.1': '*',
    'so:libssl.so.1.0.0': '*',
    'so:libstdc++.so.6': '*',
    'so:libuv.so.1': '*',
    'so:libz.so.1': '*'
  },
  provides: { nodejs: '8.9.3-r1', 'nodejs-lts': '8.9.3' },
  size: 7133998
};

describe('APK', () => {
  it('should get database', async () => {
    const database = await getDatabase();
    expect(database.list().length).to.equal(5655);
    expect(database.getByName('nodejs')).to.deep.equal(nodejsPackage);
  });

  it('should download multiple repositories', async () => {
    const database = new apk.Database();
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
      'nodejs-8.9.3-r1',
      'ca-certificates-20190108-r0',
      'busybox-1.27.2-r11',
      'musl-1.1.18-r4',
      'libressl2.6-libcrypto-2.6.5-r0',
      'nodejs-npm-8.9.3-r1',
      'c-ares-1.13.0-r0',
      'libcrypto1.0-1.0.2t-r0',
      'zlib-1.2.11-r1',
      'libgcc-6.4.0-r5',
      'http-parser-2.7.1-r1',
      'libssl1.0-1.0.2t-r0',
      'libstdc++-6.4.0-r5',
      'libuv-1.17.0-r0'
    ]);
  });
});
