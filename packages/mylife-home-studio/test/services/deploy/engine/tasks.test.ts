'use strict';

const path          = require('path');
const fs            = require('fs-extra');
const { expect }    = require('chai');
const express       = require('express');
const tasks         = require('../../lib/engine/tasks');
const vfs           = require('../../lib/engine/vfs');
const { SSHServer } = require('./ssh-server');
const directories   = require('../../lib/directories');
const {
  formatStructure,
  expectConfigContent,
  expectConfigSymlink,
  //printLines
} = require('./utils');

let cachedRoot;

const logger = (category, severity, message) => {
  process.env.VERBOSE === '1' && console.log(`${severity} : [${category}] ${message}`); // eslint-disable-line no-console
};

const pad = number => ((number < 10) ? ('0' + number) : number);

const printDate = date =>
  date.getFullYear() +
  pad(date.getMonth() + 1) +
  pad(date.getDate()) +
  '-' +
  pad(date.getHours()) +
  pad(date.getMinutes()) +
  pad(date.getSeconds());

async function initContext(options = {}) {
  if(options.noload) {
    return { logger };
  }

  if(!options.nocache && cachedRoot) {
    return { logger, root: cachedRoot };
  }

  const context = { logger };
  await tasks.ImageImport.execute(context, {
    archiveName : 'rpi-devel-base.tar.gz',
    rootPath    : 'mmcblk0p1'
  });
  !options.nocache && (cachedRoot = context.root);
  return context;
}

function createHierarchy(rootfs, hierarchy) {
  for(const [name, item] of Object.entries(hierarchy)) {
    if(typeof item === 'string' || item instanceof Buffer) {
      const file = new vfs.File({ name, content : (item instanceof Buffer ? item : Buffer.from(item)) });
      rootfs.add(file);
      continue;
    }

    const directory = new vfs.Directory({ name });
    rootfs.add(directory);
    createHierarchy(directory, item);
  }
}

async function runSshTest(hierarchy, expectedHierarchy, expectedCmds, tester) {
  let nextCmd = 0;

  const cmdhandler = cmd => {
    const def = expectedCmds[nextCmd++];
    expect(def.command === cmd);
    return def.result;
  };

  const rootfs = new vfs.Directory();
  createHierarchy(rootfs, hierarchy);
  const expectedRootfs = new vfs.Directory();
  createHierarchy(expectedRootfs, expectedHierarchy);

  const server = new SSHServer({
    port : 8822,
    rootfs,
    cmdhandler, hostKeys : [ fs.readFileSync(path.resolve(__dirname, '../resources/files/id_rsa')) ]
  });

  try {
    await tester();
  } finally {
    server.close();
  }

  expect(nextCmd).to.equal(expectedCmds.length);
  expect(formatStructure(rootfs)).to.deep.equal(formatStructure(expectedRootfs));
}

describe('Tasks', () => {

  beforeEach(() => {
    directories.configure(path.resolve(__dirname, '../resources'));
  });

  describe('ImageImport', () => {
    it('Should execute properly', async () => {
      const context = await initContext();

      expect(formatStructure(context.root)).to.deep.equal(require('./content/archive-base'));
    });
  });

  describe('ImageRemove', () => {
    it('Should execute properly', async () => {
      const context = await initContext({ nocache : true });
      await tasks.ImageRemove.execute(context, { path: '/apks/armhf/APKINDEX.tar.gz' });

      const content = require('./content/archive-base').filter(c => c.name !== 'APKINDEX.tar.gz');
      expect(formatStructure(context.root)).to.deep.equal(content);
    });
  });

  describe('ImageCache', () => {
    let server;

    beforeEach(() => {
      const app = express();
      app.use(express.static(path.resolve(__dirname, '../resources/repository')));
      server = app.listen(4242);
    });

    afterEach(done => server.close(done));

    it('Should execute properly', async () => {
      const context = await initContext({ nocache : true });
      await tasks.ConfigInit.execute(context, {});
      await tasks.ConfigPackage.execute(context, { name : 'nodejs' });

      // use fake repo
      vfs.writeText(context.config, [ 'etc', 'apk', 'repositories' ], '/media/mmcblk0p1/apks\nhttp://localhost:4242');

      await tasks.ImageCache.execute(context, {});

      const cache = vfs.path(context.root, [ 'cache' ]);
      const list  = cache.list().map(f => ({ name : f.name, size : f.content.length }));

      expect(list).to.deep.equal(require('./content/cache'));
    });

    it('Should execute properly without cache directory', async () => {
      const context = await initContext({ nocache : true });
      await tasks.ConfigInit.execute(context, {});
      await tasks.ConfigPackage.execute(context, { name : 'nodejs' });
      await tasks.ImageRemove.execute(context, { path : '/cache' });

      // use fake repo
      vfs.writeText(context.config, [ 'etc', 'apk', 'repositories' ], '/media/mmcblk0p1/apks\nhttp://localhost:4242');

      await tasks.ImageCache.execute(context, {});

      const cache = vfs.path(context.root, [ 'cache' ]);
      const list  = cache.list().map(f => ({ name : f.name, size : f.content.length }));

      expect(list).to.deep.equal(require('./content/cache'));
    });
  });

  describe('ImageDeviceTreeOverlay', () => {
    it('Should execute properly', async () => {
      const context = await initContext({ nocache : true });
      await tasks.ImageDeviceTreeOverlay.execute(context, { content: 'test-overlay1' });
      await tasks.ImageDeviceTreeOverlay.execute(context, { content: 'test-overlay2' });

      const usercfg  = vfs.readText(context.root, [ 'usercfg.txt' ]);
      const expected = [ 'dtoverlay=test-overlay1', 'dtoverlay=test-overlay2' ].join('\n') + '\n';
      expect(usercfg).to.equal(expected);
    });
  });

  describe('ImageDeviceTreeParam', () => {
    it('Should execute properly', async () => {
      const context = await initContext({ nocache : true });
      await tasks.ImageDeviceTreeParam.execute(context, { content: 'test-param1' });
      await tasks.ImageDeviceTreeParam.execute(context, { content: 'test-param2' });

      const usercfg  = vfs.readText(context.root, [ 'usercfg.txt' ]);
      const expected = [ 'dtparam=test-param1', 'dtparam=test-param2' ].join('\n') + '\n';
      expect(usercfg).to.equal(expected);
    });
  });

  describe('ImageCmdlineAdd', () => {
    it('Should execute properly', async () => {
      const context = await initContext({ nocache : true });
      await tasks.ImageCmdlineAdd.execute(context, { content: 'test-param1' });

      expect(vfs.readText(context.root, [ 'cmdline.txt' ])).to.equal('modules=loop,squashfs,sd-mod,usb-storage quiet dwc_otg.lpm_enable=0 console=ttyAMA0,115200 console=tty1 test-param1\n');
    });
  });

  describe('ImageCmdlineRemove', () => {
    it('Should execute properly', async () => {
      const context = await initContext({ nocache : true });
      await tasks.ImageCmdlineAdd.execute(context, { content: 'test-param1' });
      await tasks.ImageCmdlineAdd.execute(context, { content: 'test-param2' });
      await tasks.ImageCmdlineAdd.execute(context, { content: 'test-param3' });
      await tasks.ImageCmdlineRemove.execute(context, { content: 'test-param1' });
      await tasks.ImageCmdlineRemove.execute(context, { content: 'test-param3' });

      expect(vfs.readText(context.root, [ 'cmdline.txt' ])).to.equal('modules=loop,squashfs,sd-mod,usb-storage quiet dwc_otg.lpm_enable=0 console=ttyAMA0,115200 console=tty1 test-param2\n');
    });
  });

  describe('ImageCoreComponents', () => {
    it('Should execute properly without flavor', async () => {
      const context = await initContext({ nocache : true });
      await tasks.ImageCoreComponents.execute(context, { file : 'components.json' });

      expect(vfs.readText(context.root, [ 'mylife-home', 'mylife-home-core-components.json' ])).to.equal('\'components\'');
    });

    it('Should execute properly with flavor', async () => {
      const context = await initContext({ nocache : true });
      await tasks.ImageCoreComponents.execute(context, { file : 'components.json', flavor :'my-flavor' });

      expect(vfs.readText(context.root, [ 'mylife-home', 'mylife-home-core-my-flavor-components.json' ])).to.equal('\'components\'');
    });
  });

  describe('ImageLs', () => {
    it('Should execute properly', async () => {
      const context = await initContext();
      await tasks.ImageLs.execute(context, { path: '/' });

      // TODO: expect logs ?
    });
  });

  describe('ImageInstall', () => {
    it('Should execute properly', async () => runSshTest({ 'media' : { 'mmcblk0p1' : {
      'backup-1' : {
        'file1'  : 'old1-content1',
        '.file2' : 'old1-content2',
      },
      'backup-2' : {
        'file1'  : 'old2-content1',
        '.file2' : 'old2-content2',
      },
      'file1'  : 'content1',
      '.file2' : 'content2',
    } } }, { 'media' : { 'mmcblk0p1' : {
      'backup-1' : {
        'file1'  : 'old1-content1',
        '.file2' : 'old1-content2',
      },
      'backup-2' : {
        'file1'  : 'old2-content1',
        '.file2' : 'old2-content2',
      },
      [`backup-${printDate(new Date())}`] : {
        'file1'  : 'content1',
        '.file2' : 'content2',
      },
      'file1'   : 'new-content1',
      '.file2'  : 'new-content2',
      'subdir1' : {
        'file1' : 'new-sub-content1'
      }
    } } }, [
      { command : 'mount -o remount,rw /media/mmcblk0p1', result : '' },
      { command : 'reboot', result : '' },
    ], async () => {

      const context = await initContext({ noload : true });
      context.root = new vfs.Directory();
      createHierarchy(context.root, {
        'file1'   : 'new-content1',
        '.file2'  : 'new-content2',
        'subdir1' : {
          'file1' : 'new-sub-content1'
        }
      });

      await tasks.ImageInstall.execute(context, { host : 'localhost:8822', user : 'root', keyFile : 'id_rsa' });
    }));
  });

  describe('ImageExport', () => {
    it('Should execute properly', async () => {
      const context = await initContext({ nocache : true });
      let destContent;

      const tmpDir = '/tmp/mylife-home-deploy-test-task-export';
      directories.configure(tmpDir);
      await fs.ensureDir(directories.files());
      try {
        await tasks.ImageExport.execute(context, { archiveName : 'image-export.tar.gz' });
        destContent = await fs.readFile(path.join(tmpDir, 'files/image-export.tar.gz'));
      } finally {
        await fs.remove(tmpDir);
      }

      expect(destContent.length).to.equal(74553665);
    });
  });

  describe('ImageReset', () => {
    it('Should execute properly', async () => {
      const context = await initContext({ nocache : true });
      await tasks.ConfigInit.execute(context, {});
      await tasks.ConfigPack.execute(context, {});
      await tasks.VariablesSet.execute(context, { name: 'variable', value: 'value' });
      await tasks.ImageReset.execute(context, {});

      expect(context.variables).to.deep.equal({ variable : 'value' });
      expect(context.root).to.be.null;
      expect(context.config).to.be.null;
    });
  });

  describe('ConfigInit', () => {
    it('Should execute properly', async () => {
      const context = await initContext();
      await tasks.ConfigInit.execute(context, {});

      expect(formatStructure(context.root)).to.deep.equal(require('./content/archive-base'));
      expect(formatStructure(context.config)).to.deep.equal(require('./content/archive-config'));
    });
  });

  describe('ConfigImport', () => {
    it('Should execute properly', async () => {
      const context = await initContext();
      await tasks.ConfigInit.execute(context, {});

      await tasks.ConfigImport.execute(context, {
        archiveName : 'config-import.tar.gz'
      });

      expect(formatStructure(context.config)).to.deep.equal([
        ... require('./content/archive-config'),
        { indent : 1, name: 'my-config',      uid : 0, gid : 0,  mode : 0o755, atime : null, mtime : new Date(1516872309000), ctime : null, dir : true },
        { indent : 2, name: 'my-config.conf', uid : 0, gid : 0,  mode : 0o644, atime : null, mtime : new Date(1516872309000), ctime : null, length : 10 },
      ]);
    });
  });

  describe('ConfigHostname', () => {
    it('Should execute properly', async () => {
      const hostname = 'test-host';
      const context  = await initContext();
      await tasks.ConfigInit.execute(context, {});

      await tasks.ConfigHostname.execute(context, {
        hostname
      });

      expectConfigContent(context, [ 'etc', 'hostname' ]);
      expectConfigContent(context, [ 'etc', 'network', 'interfaces' ]);
      expectConfigContent(context, [ 'etc', 'hosts' ]);
    });
  });

  describe('ConfigHwaddress', () => {
    it('Should execute properly', async () => {
      const iface   = 'eth0';
      const address = '11:22:33:44:55:66';
      const context  = await initContext();
      await tasks.ConfigInit.execute(context, {});

      await tasks.ConfigHwaddress.execute(context, {
        iface, address
      });

      expectConfigContent(context, [ 'etc', 'network', 'interfaces' ], 'hwaddr');
    });
  });

  describe('ConfigWifi', () => {
    it('Should execute properly', async () => {
      const context  = await initContext();
      await tasks.ConfigInit.execute(context, {});

      await tasks.ConfigWifi.execute(context, {
        iface : 'wlan0',
        ssid  : 'test-ssid',
        psk   :'123456789abcdef'
      });

      expectConfigContent(context, [ 'etc', 'network', 'interfaces' ], 'wifi');
      expectConfigContent(context, [ 'etc', 'wpa_supplicant', 'wpa_supplicant.conf' ]);
    });
  });

  describe('ConfigDaemon', () => {
    it('Should execute properly', async () => {
      const runlevel = 'default';
      const name = 'test-daemon';
      const context  = await initContext();
      await tasks.ConfigInit.execute(context, {});

      await tasks.ConfigDaemon.execute(context, {
        name, runlevel
      });

      expectConfigSymlink(context, [ 'etc', 'runlevels', runlevel, name ], `/etc/init.d/${name}`);
    });
  });

  describe('ConfigPackage', () => {
    it('Should execute properly', async () => {
      const name = 'test-package';
      const context  = await initContext();
      await tasks.ConfigInit.execute(context, {});

      await tasks.ConfigPackage.execute(context, {
        name
      });

      expectConfigContent(context, [ 'etc', 'apk', 'world' ]);
    });
  });

  describe('ConfigLs', () => {
    it('Should execute properly', async () => {
      const context = await initContext();
      await tasks.ConfigInit.execute(context, {});
      await tasks.ConfigLs.execute(context, { path: '/' });

      // TODO: expect logs ?
    });
  });

  describe('ConfigPack', () => {
    it('Should execute properly', async () => {
      const context = await initContext({ nocache : true });
      await tasks.ConfigInit.execute(context, {});
      const node = vfs.path(context.root, [ 'rpi-devel.apkovl.tar.gz' ]);
      node.content = Buffer.alloc(0); // reset config file

      await tasks.ConfigPack.execute(context, {});

      expect(node.content.length).to.equal(10603);
    });
  });

  describe('VariablesSet', () => {
    it('Should execute properly', async () => {
      const context = await initContext({ noload: true });
      await tasks.VariablesSet.execute(context, { name: 'variable', value: 'value' });

      expect(context.variables).to.deep.equal({ variable : 'value' });
    });
  });

  describe('VariablesReset', () => {
    it('Should execute properly', async () => {
      const context = await initContext();
      await tasks.ConfigInit.execute(context, {});
      await tasks.ConfigPack.execute(context, {});
      await tasks.VariablesSet.execute(context, { name: 'variable', value: 'value' });
      await tasks.VariablesReset.execute(context, {});

      expect(context.variables).to.be.null;
      expect(context.root).to.exist;
      expect(context.config).to.exist;
    });
  });
});
