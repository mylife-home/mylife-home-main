'use strict';

const fs             = require('fs');
const path           = require('path');
const { expect }     = require('chai');
const vfs            = require('../../lib/engine/vfs');
const { SSHClient }  = require('../../lib/engine/ssh');
const { SSHServer }  = require('./ssh-server');
const { expectFail } = require('./utils');

const useRealWorld    = process.env.SSH_REAL_WORLD === '1';
const realKeyAuthFile = '/Users/vincent/Downloads/id_rsa';
const realHost        = 'rpi-devel';

async function runClientRealServerTest(tester) {
  const privateKey = fs.readFileSync(realKeyAuthFile);
  const client = new SSHClient();
  await client.connect({ host : realHost, username : 'root', privateKey });
  try {
    await tester(client);
  } finally {
    client.end();
  }
}

async function runClientMockedServerTest(rootfs, cmdhandler, tester) {
  const port = 8822;
  const server = new SSHServer({ port, rootfs, cmdhandler, hostKeys : [ fs.readFileSync(path.resolve(__dirname, '../resources/files/id_rsa')) ] });
  const client = new SSHClient();
  await client.connect({ host : 'localhost', port, username : 'root', password : 'nothing' });
  try {
    await tester(client);
  } finally {
    client.end();
    server.close();
  }
}

const sort = (arr, compFn) => [ ...arr ].sort(compFn);

const comparer = (x, y) => {
  if (x === y) {
    return 0;
  }
  if(typeof x === 'number' && typeof y === 'number') {
    return x - y;
  }
  x = x && x.toString();
  y = y && y.toString();
  if (x === y) {
    return 0;
  }
  return x < y ? -1 : 1;
};

const sortBy = (arr, accessor) => sort(arr, (x, y) => {
  const vx = accessor(x);
  const vy = accessor(y);
  return comparer(vx, vy);
});

// need clone because readdir result contains Stats objects
const clone = obj => JSON.parse(JSON.stringify(obj));

describe('SSH', () => {

  describe('Basic execution', () => {

    (useRealWorld ? describe : describe.skip)('Client to real server', () => {

      const rootList = [ '.modloop', 'bin', 'dev', 'etc', 'home', 'lib', 'media', 'mnt', 'proc', 'root', 'run', 'sbin', 'srv', 'sys', 'tmp', 'usr', 'var' ];

      it('Should properly execute command on remote host in real world', async () => runClientRealServerTest(async client => {
        expect(await client.exec('ls -a /')).to.equal([ '.', '..', ...rootList ].map(it => `${it}\n`).join(''));
      }));

      it('Should properly read sftp directory on remote host in real world', async () => runClientRealServerTest(async client => {
        const list = await client.sftp.readdir('/');
        expect(sort(list.map(it => it.filename))).to.deep.equal(rootList);
      }));

      it('Should combine exec and sftp in same session in real world', async () => runClientRealServerTest(async client => {
        await client.exec('ls -a /');
        await client.sftp.readdir('/');
        await client.exec('ls -a /');
        await client.sftp.readdir('/');
      }));
    });

    describe('Client to mocked server', () => {

      const command = 'MyCmd';
      const commandResult = 'MyResult';

      function cmdHandler(cmd) {
        if(command !== cmd) {
          throw new Error('Unknown command');
        }
        return commandResult;
      }

      it('Should properly execute command on mocked server', async () => await runClientMockedServerTest(new vfs.Directory(), cmdHandler, async client => {
        expect(await client.exec(command)).to.equal(commandResult);
      }));

      it('Should fail to execute wrong command on mocked server', async () => await runClientMockedServerTest(new vfs.Directory(), cmdHandler, async client => {
        await expectFail(async () => await client.exec('wrong command'), /Error: Command has error output : 'Unknown command'/);
      }));

      it('Should properly use sftp to read directory on moched server', async () => {
        const rootfs = new vfs.Directory();
        const attrs = { uid : 5, gid : 6, atime : new Date(2000, 0, 1, 10, 30), mtime : new Date(2010, 5, 10, 10, 30) };

        rootfs.add(new vfs.Directory({ name : 'dir',   mode : 0o755, ...attrs }));
        rootfs.add(new vfs.File(     { name : 'file',  mode : 0o644, ...attrs, content : Buffer.alloc(10) }));
        rootfs.add(new vfs.Symlink(  { name : 'slink', mode : 0o777, ...attrs, target : './file' }));

        const eattrs = { ...attrs, atime : attrs.atime.valueOf() / 1000, mtime : attrs.mtime.valueOf() / 1000 };

        const expected = [{
          attrs    : { ...eattrs, size : 0, mode : 0o040755, permissions : 0o040755 },
          filename : 'dir',
          longname : 'drwxr-xr-x 1 5        6                   0 Jun 10 10:30 dir'
        }, {
          attrs    : { ...eattrs, size : 10, mode : 0o100644, permissions : 0o100644 },
          filename : 'file',
          longname : '-rw-r--r-- 1 5        6                  10 Jun 10 10:30 file'
        }, {
          attrs    : { ...eattrs, size : './file'.length, mode : 0o120777, permissions : 0o120777 },
          filename : 'slink',
          longname : 'lrwxrwxrwx 1 5        6                   6 Jun 10 10:30 slink -> ./file'
        }];
        await runClientMockedServerTest(rootfs, cmdHandler, async (client) => {
          const result = await client.sftp.readdir('/');
          expect(clone(result)).to.deep.equal(expected);
        });
      });
    });
  });

  describe('SFTP manipulations', () => {

    const rootPath = '/tmp/sftp-test';

    async function expectDir(client, { expected, path = rootPath }) {
      const list = await client.sftp.readdir(path);
      const simple = list.map(it => ({
        name : it.filename,
        mode : it.attrs.mode,
        uid  : it.attrs.uid,
        gid  : it.attrs.gid,
        size : (it.attrs.mode & 0o40000) ? 0 : it.attrs.size // not implemented on mocked server directories
      }));
      expect(sortBy(simple, it => it.name)).to.deep.equal(sortBy(expected, it => it.name));
    }

    const envs = [{
      description : 'real world',
      use         : useRealWorld,
      runner      : async tester => await runClientRealServerTest(async client => {
        await client.exec(`mkdir -p ${rootPath}`);
        try {
          await tester(client);
        } finally {
          await client.exec(`rm -rf ${rootPath}`);
        }
      })
    }, {
      description : 'mocked server',
      use : true,
      runner : async tester => {
        const rootfs = new vfs.Directory();
        const tmp = new vfs.Directory({ name : 'tmp', mode : 0o777 });
        rootfs.add(tmp);
        tmp.add(new vfs.Directory({ name : 'sftp-test', mode : 0o755 }));

        await runClientMockedServerTest(rootfs, () => '', tester);
      }
    }];

    const tests = [
      { description : 'should properly read root content' , run : async client => {
        await expectDir(client, { expected : [] });
      }},

      { description : 'should properly create directory' , run : async client => {
        await client.sftp.mkdir('/tmp/sftp-test/new-dir');
        await expectDir(client, { expected : [{ name : 'new-dir', uid : 0, gid : 0, mode : 0o40755, size : 0 }] });
      }},

      { description : 'should fail to create an existing directory' , run : async client => {
        await client.sftp.mkdir('/tmp/sftp-test/new-dir');
        await expectFail(async() => await client.sftp.mkdir('/tmp/sftp-test/new-dir'), /Error: Failure/);
      }},

      { description : 'should properly create then remove directory' , run : async client => {
        await client.sftp.mkdir('/tmp/sftp-test/new-dir');
        await client.sftp.rmdir('/tmp/sftp-test/new-dir');
        await expectDir(client, { expected : [] });
      }},

      { description : 'should properly move a directory' , run : async client => {
        await client.sftp.mkdir('/tmp/sftp-test/new-dir');
        await client.sftp.rename('/tmp/sftp-test/new-dir', '/tmp/sftp-test/new-dir-new');
        await expectDir(client, { expected : [{ name : 'new-dir-new', uid : 0, gid : 0, mode : 0o40755, size : 0 }] });
      }},

      { description : 'should properly move a subdirectory' , run : async client => {
        await client.sftp.mkdir('/tmp/sftp-test/new-dir1');
        await client.sftp.mkdir('/tmp/sftp-test/new-dir2');
        await client.sftp.mkdir('/tmp/sftp-test/new-dir1/sub-dir');
        await client.sftp.rename('/tmp/sftp-test/new-dir1/sub-dir', '/tmp/sftp-test/new-dir2/sub-dir');

        await expectDir(client, { expected : [
          { name : 'new-dir1', uid : 0, gid : 0, mode : 0o40755, size : 0 },
          { name : 'new-dir2', uid : 0, gid : 0, mode : 0o40755, size : 0 }
        ] });

        await expectDir(client, { path : path.join(rootPath, 'new-dir1'), expected : [] });

        await expectDir(client, { path : path.join(rootPath, 'new-dir2'), expected : [
          { name : 'sub-dir', uid : 0, gid : 0, mode : 0o40755, size : 0 }
        ] });
      }},

      { description : 'should properly upload a file' , run : async client => {
        await client.sftp.writeFile('/tmp/sftp-test/file', Buffer.from('toto'));
        await expectDir(client, { expected : [{ name : 'file', uid : 0, gid : 0, mode : 0o100644, size : 4 }] });
      }},

      { description : 'should properly download a file' , run : async client => {
        const source = Buffer.from('toto');
        await client.sftp.writeFile('/tmp/sftp-test/file', source);
        const dest = await client.sftp.readFile('/tmp/sftp-test/file');
        expect(dest).to.deep.equal(source);
      }},

      { description : 'should properly unlink a file' , run : async client => {
        await client.sftp.writeFile('/tmp/sftp-test/file', Buffer.from('toto'));
        await client.sftp.unlink('/tmp/sftp-test/file');
        await expectDir(client, { expected : [] });
      }},
    ];

    for(const env of envs) {
      (env.use ? describe : describe.skip)(`using ${env.description}`, () => {
        for(const test of tests) {
          it(test.description,  async () => await env.runner(test.run));
        }
      });
    }

  });

});
