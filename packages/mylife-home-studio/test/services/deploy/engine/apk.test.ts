'use strict';

const { expect } = require('chai');
const apk        = require('../../lib/engine/apk');

const repo1 = 'http://dl-4.alpinelinux.org/alpine/v3.7/main/';
const repo2 = 'http://dl-4.alpinelinux.org/alpine/v3.6/main/';

let cachedDatabase;

async function getDatabase() {
  if(cachedDatabase) {
    return cachedDatabase;
  }

  const database = new apk.Database();
  await database.addRepository(repo1);
  database.index();
  cachedDatabase = database;
  return database;
}

const nodejsPackage = {
  raw          : 'C:Q1G4khijXgbIREHU26+toG2eIuYhU=\nP:nodejs\nV:8.9.3-r0\nA:armhf\nS:7134025\nI:19423232\nT:JavaScript runtime built on V8 engine - LTS version\nU:https://nodejs.org/\nL:MIT\no:nodejs\nm:Jakub Jirutka <jakub@jirutka.cz>\nt:1512781942\nc:33e07701fafe36a157f32d67a4f84670a31a7a55\nD:ca-certificates nodejs-npm=8.9.3-r0 so:libc.musl-armhf.so.1 so:libcares.so.2 so:libcrypto.so.1.0.0 so:libgcc_s.so.1 so:libhttp_parser.so.2.7.1 so:libssl.so.1.0.0 so:libstdc++.so.6 so:libuv.so.1 so:libz.so.1\np:nodejs-lts=8.9.3 cmd:node\n\n',
  name         : 'nodejs',
  version      : '8.9.3-r0',
  architecture : 'armhf',
  size         : 7134025,
  csum         : Buffer.from([ 0x1b, 0x89, 0x21, 0x8a, 0x35, 0xe0, 0x6c, 0x84, 0x44, 0x1d, 0x4d, 0xba, 0xfa, 0xda, 0x06, 0xd9, 0xe2, 0x2e, 0x62, 0x15 ]),
  repo         : 'http://dl-4.alpinelinux.org/alpine/v3.7/main',
  dependencies : {
    'ca-certificates'            : '*',
    'nodejs-npm'                 : '8.9.3-r0',
    'so:libc.musl-armhf.so.1'    : '*',
    'so:libcares.so.2'           : '*',
    'so:libcrypto.so.1.0.0'      : '*',
    'so:libgcc_s.so.1'           : '*',
    'so:libhttp_parser.so.2.7.1' : '*',
    'so:libssl.so.1.0.0'         : '*',
    'so:libstdc++.so.6'          : '*',
    'so:libuv.so.1'              : '*',
    'so:libz.so.1'               : '*'
  },
  provides: {
    nodejs       : '8.9.3-r0',
    'nodejs-lts' : '8.9.3'
  }
};

describe('APK', () => {

  it('Should get database', async () => {
    const database = await getDatabase();
    expect(database.list().length).to.equal(5648);
    expect(database.getByName('nodejs')).to.deep.equal(nodejsPackage);
  });

  it('Shoud download multiple repository', async () => {
    const database = new apk.Database();
    await database.addRepository(repo2);
    await database.addRepository(repo1);
    database.index();
    expect(database.list().length).to.equal(11149);
    expect(database.getByName('nodejs')).to.deep.equal(nodejsPackage);

    expect(database.getByProvide('nodejs').map(p => ({ name: p.name, version: p.version }))).to.deep.equal([
      { name: 'nodejs', version: '8.9.3-r0'  },
      { name: 'nodejs', version: '6.10.3-r1' }
    ]);
  });

  it('Should get package install list', async () => {
    const database = await getDatabase();

    const installList = new apk.InstallList(database);
    installList.addPackage('nodejs');

    const packages = installList.list().map(it => it.name + '-' + it.version);
    expect(packages).to.deep.equal([
      'nodejs-8.9.3-r0',
      'ca-certificates-20171114-r0',
      'busybox-1.27.2-r8',
      'musl-1.1.18-r2',
      'libressl2.6-libcrypto-2.6.3-r0',
      'nodejs-npm-8.9.3-r0',
      'c-ares-1.13.0-r0',
      'libcrypto1.0-1.0.2n-r0',
      'zlib-1.2.11-r1',
      'libgcc-6.4.0-r5',
      'http-parser-2.7.1-r1',
      'libssl1.0-1.0.2n-r0',
      'libstdc++-6.4.0-r5',
      'libuv-1.17.0-r0'
    ]);
  });
});
