import path from 'path';
import fs from 'fs-extra';
import { expect } from 'chai';
import express from 'express';
import tasks, { listMeta } from '../../../src/services/deploy/tasks';
import * as vfs from '../../../src/services/deploy/engine/vfs';
import { SSHServer } from './engine/ssh-server';
import * as directories from '../../../src/services/deploy/directories';
import { formatStructure, expectConfigContent, expectConfigSymlink } from './utils';
import { createExecutionContext, setupDataDirectory } from './utils';

import contentArchiveBase from './content/archive-base';
import contentCache from './content/cache';
import contentArchiveConfig from './content/archive-config';
import { Server } from 'http';

describe('Tasks', () => {
  beforeEach(() => {
    setupDataDirectory(path.resolve(__dirname, 'resources'));
  });

  it('should provide metadata of tasks', () => {
    const result = listMeta();

    expect(result).to.deep.equal([
      {
        name: 'config-init',
        description: 'Extract the config (.apkovl.tar.gz) from the image to context.config',
        parameters: [],
      },
      {
        name: 'config-import',
        description: 'Import the specified archive into the root fs of the config',
        parameters: [{ name: 'archiveName', description: 'archive name', type: 'string' }],
      },
      {
        name: 'config-hostname',
        description: 'set the hostname',
        parameters: [{ name: 'hostname', description: 'host name', type: 'string' }],
      },
      {
        name: 'config-hwaddress',
        description: 'set the hardware address of a network interface',
        parameters: [
          { name: 'iface', description: 'network interface name (eg: eth0)', type: 'string' },
          { name: 'address', description: 'mac address to set (eg: 11:22:33:44:55:66)', type: 'string' },
        ],
      },
      {
        name: 'config-wifi',
        description: 'configure a wifi interface (wpa_supplicant package and daemon required)',
        parameters: [
          { name: 'iface', description: 'network interface name (eg: wlan0)', type: 'string' },
          { name: 'ssid', description: 'wifi ssid', type: 'string' },
          { name: 'psk', description: 'psk as in command output : wpa_passphrase MYSSID passphrase', type: 'string' },
        ],
      },
      {
        name: 'config-package',
        description: 'add a package to be installed',
        parameters: [{ name: 'name', description: 'package name', type: 'string' }],
      },
      {
        name: 'config-daemon',
        description: 'add a daemon process to be started at a runlevel',
        parameters: [
          { name: 'name', description: 'daemon name', type: 'string' },
          { name: 'runlevel', description: 'runlevel', type: 'string', default: 'default' },
        ],
      },
      {
        name: 'config-ls',
        description: 'print the content of a directory from the config fs',
        parameters: [{ description: 'path to directory to list', name: 'path', type: 'string' }],
      },
      {
        name: 'config-pack',
        description: 'pack the config into the root fs',
        parameters: [],
      },
      {
        name: 'image-import',
        description: 'import the specified archive into the root fs of the image',
        parameters: [
          { name: 'archiveName', description: 'archive name', type: 'string' },
          { name: 'rootPath', description: 'path of the root fs inside the archive', type: 'string', default: '' },
        ],
      },
      {
        name: 'image-remove',
        description: 'remove a node (file/directory/symlink) from the root fs',
        parameters: [{ name: 'path', description: 'path to remove name', type: 'string' }],
      },
      {
        name: 'image-cache',
        description: 'setup package cache of the image, from /etc/apk/repositories and /etc/apk/world in config (equivalent of apk cache sync in some way)',
        parameters: [],
      },
      {
        name: 'image-device-tree-overlay',
        description: 'add a dtoverlay line in image usercfg.txt ( https://www.raspberrypi.org/documentation/configuration/device-tree.md )',
        parameters: [{ name: 'content', description: 'overlay data to add', type: 'string' }],
      },
      {
        name: 'image-device-tree-param',
        description: 'add a dtparam line in image usercfg.txt ( https://www.raspberrypi.org/documentation/configuration/device-tree.md )',
        parameters: [{ name: 'content', description: 'param data to add', type: 'string' }],
      },
      {
        name: 'image-cmdline-add',
        description: 'add a parameter to cmdline.txt',
        parameters: [{ name: 'content', description: 'parameter data to add', type: 'string' }],
      },
      {
        name: 'image-cmdline-remove',
        description: 'remove a parameter from cmdline.txt',
        parameters: [{ name: 'content', description: 'parameter data to search and remove', type: 'string' }],
      },
      {
        name: 'image-core-components',
        description: 'setup core components file',
        parameters: [
          { name: 'file', description: 'file name to import', type: 'string' },
          { name: 'flavor', description: 'flavor of mylife-home-core setup', type: 'string', default: '' },
        ],
      },
      {
        name: 'image-ls',
        description: 'print the content of a directory from the root fs',
        parameters: [{ name: 'path', description: 'path to directory to list', type: 'string' }],
      },
      {
        name: 'image-install',
        description: 'install the current root fs to the target host using SSH',
        parameters: [
          { name: 'host', description: 'Target host', type: 'string' },
          { name: 'user', description: 'User to use on target host', type: 'string' },
          { name: 'keyFile', description: 'SSH key to log in', type: 'string' },
        ],
      },
      {
        name: 'image-export',
        description: 'export the root fs of the image into the specified archive',
        parameters: [{ name: 'archiveName', description: 'archive name', type: 'string' }],
      },
      {
        name: 'image-reset',
        description: 'reset image data (root fs, config, image)',
        parameters: [],
      },
      {
        name: 'variables-set',
        description: 'set a variable to a value',
        parameters: [
          { name: 'name', description: 'variable name', type: 'string' },
          { name: 'value', description: 'variable value', type: 'string' },
        ],
      },
      {
        name: 'variables-reset',
        description: 'reset variables',
        parameters: [],
      },
    ]);
  });

  describe('ImageImport', () => {
    it('should execute properly', async () => {
      const context = await initContext();

      expect(formatStructure(context.root)).to.deep.equal(contentArchiveBase);
    });
  });

  describe('ImageRemove', () => {
    it('should execute properly', async () => {
      const context = await initContext({ nocache: true });
      await tasks.ImageRemove.execute(context, { path: '/apks/armhf/APKINDEX.tar.gz' });

      const content = contentArchiveBase.filter((c) => c.name !== 'APKINDEX.tar.gz');
      expect(formatStructure(context.root)).to.deep.equal(content);
    });
  });

  describe('ImageCache', () => {
    let server: Server;

    beforeEach(() => {
      const app = express();
      app.use(express.static(path.resolve(__dirname, 'resources/repository')));
      server = app.listen(4242);
    });

    afterEach((done) => server.close(done));

    it('should execute properly', async () => {
      const context = await initContext({ nocache: true });
      await tasks.ConfigInit.execute(context, {});
      await tasks.ConfigPackage.execute(context, { name: 'nodejs' });

      // use fake repo
      vfs.writeText(context.config, ['etc', 'apk', 'repositories'], '/media/mmcblk0p1/apks\nhttp://localhost:4242');

      await tasks.ImageCache.execute(context, {});

      const cache = vfs.path(context.root, ['cache']) as vfs.Directory;
      const list = cache.list().map((f: vfs.File) => ({ name: f.name, size: f.content.length }));

      expect(list).to.deep.equal(contentCache);
    });

    it('should execute properly without cache directory', async () => {
      const context = await initContext({ nocache: true });
      await tasks.ConfigInit.execute(context, {});
      await tasks.ConfigPackage.execute(context, { name: 'nodejs' });
      await tasks.ImageRemove.execute(context, { path: '/cache' });

      // use fake repo
      vfs.writeText(context.config, ['etc', 'apk', 'repositories'], '/media/mmcblk0p1/apks\nhttp://localhost:4242');

      await tasks.ImageCache.execute(context, {});

      const cache = vfs.path(context.root, ['cache']) as vfs.Directory;
      const list = cache.list().map((f: vfs.File) => ({ name: f.name, size: f.content.length }));

      expect(list).to.deep.equal(contentCache);
    });
  });

  describe('ImageDeviceTreeOverlay', () => {
    it('should execute properly', async () => {
      const context = await initContext({ nocache: true });
      await tasks.ImageDeviceTreeOverlay.execute(context, { content: 'test-overlay1' });
      await tasks.ImageDeviceTreeOverlay.execute(context, { content: 'test-overlay2' });

      const usercfg = vfs.readText(context.root, ['usercfg.txt']);
      const expected = ['dtoverlay=test-overlay1', 'dtoverlay=test-overlay2'].join('\n') + '\n';
      expect(usercfg).to.equal(expected);
    });
  });

  describe('ImageDeviceTreeParam', () => {
    it('should execute properly', async () => {
      const context = await initContext({ nocache: true });
      await tasks.ImageDeviceTreeParam.execute(context, { content: 'test-param1' });
      await tasks.ImageDeviceTreeParam.execute(context, { content: 'test-param2' });

      const usercfg = vfs.readText(context.root, ['usercfg.txt']);
      const expected = ['dtparam=test-param1', 'dtparam=test-param2'].join('\n') + '\n';
      expect(usercfg).to.equal(expected);
    });
  });

  describe('ImageCmdlineAdd', () => {
    it('should execute properly', async () => {
      const context = await initContext({ nocache: true });
      await tasks.ImageCmdlineAdd.execute(context, { content: 'test-param1' });

      expect(vfs.readText(context.root, ['cmdline.txt'])).to.equal(
        'modules=loop,squashfs,sd-mod,usb-storage quiet dwc_otg.lpm_enable=0 console=ttyAMA0,115200 console=tty1 test-param1\n'
      );
    });
  });

  describe('ImageCmdlineRemove', () => {
    it('should execute properly', async () => {
      const context = await initContext({ nocache: true });
      await tasks.ImageCmdlineAdd.execute(context, { content: 'test-param1' });
      await tasks.ImageCmdlineAdd.execute(context, { content: 'test-param2' });
      await tasks.ImageCmdlineAdd.execute(context, { content: 'test-param3' });
      await tasks.ImageCmdlineRemove.execute(context, { content: 'test-param1' });
      await tasks.ImageCmdlineRemove.execute(context, { content: 'test-param3' });

      expect(vfs.readText(context.root, ['cmdline.txt'])).to.equal(
        'modules=loop,squashfs,sd-mod,usb-storage quiet dwc_otg.lpm_enable=0 console=ttyAMA0,115200 console=tty1 test-param2\n'
      );
    });
  });

  describe('ImageCoreComponents', () => {
    it('should execute properly without flavor', async () => {
      const context = await initContext({ nocache: true });
      await tasks.ImageCoreComponents.execute(context, { file: 'components.json' });

      expect(vfs.readText(context.root, ['mylife-home', 'mylife-home-core-components.json'])).to.equal("'components'");
    });

    it('should execute properly with flavor', async () => {
      const context = await initContext({ nocache: true });
      await tasks.ImageCoreComponents.execute(context, { file: 'components.json', flavor: 'my-flavor' });

      expect(vfs.readText(context.root, ['mylife-home', 'mylife-home-core-my-flavor-components.json'])).to.equal("'components'");
    });
  });

  describe('ImageLs', () => {
    it('should execute properly', async () => {
      const context = await initContext();
      await tasks.ImageLs.execute(context, { path: '/' });

      // TODO: expect logs ?
    });
  });

  describe('ImageInstall', () => {
    it('should execute properly', async () =>
      runSshTest(
        {
          media: {
            mmcblk0p1: {
              'backup-1': {
                file1: 'old1-content1',
                '.file2': 'old1-content2',
              },
              'backup-2': {
                file1: 'old2-content1',
                '.file2': 'old2-content2',
              },
              file1: 'content1',
              '.file2': 'content2',
            },
          },
        },
        {
          media: {
            mmcblk0p1: {
              'backup-1': {
                file1: 'old1-content1',
                '.file2': 'old1-content2',
              },
              'backup-2': {
                file1: 'old2-content1',
                '.file2': 'old2-content2',
              },
              [`backup-${printDate(new Date())}`]: {
                file1: 'content1',
                '.file2': 'content2',
              },
              file1: 'new-content1',
              '.file2': 'new-content2',
              subdir1: {
                file1: 'new-sub-content1',
              },
            },
          },
        },
        [
          { command: 'mount -o remount,rw /media/mmcblk0p1', result: '' },
          { command: 'reboot', result: '' },
        ],
        async () => {
          const context = await initContext({ noload: true });
          context.root = new vfs.Directory();
          createHierarchy(context.root, {
            file1: 'new-content1',
            '.file2': 'new-content2',
            subdir1: {
              file1: 'new-sub-content1',
            },
          });

          await tasks.ImageInstall.execute(context, { host: 'localhost:8822', user: 'root', keyFile: 'id_rsa' });
        }
      ));
  });

  describe('ImageExport', () => {
    it('should execute properly', async () => {
      const context = await initContext({ nocache: true });
      let destContent;

      const tmpDir = '/tmp/mylife-home-deploy-test-task-export';
      setupDataDirectory(tmpDir);
      await fs.ensureDir(directories.files());
      try {
        await tasks.ImageExport.execute(context, { archiveName: 'image-export.tar.gz' });
        destContent = await fs.readFile(path.join(tmpDir, 'files/image-export.tar.gz'));
      } finally {
        await fs.remove(tmpDir);
      }

      expect(destContent.length).to.equal(74553665);
    });
  });

  describe('ImageReset', () => {
    it('should execute properly', async () => {
      const context = await initContext({ nocache: true });
      await tasks.ConfigInit.execute(context, {});
      await tasks.ConfigPack.execute(context, {});
      await tasks.VariablesSet.execute(context, { name: 'variable', value: 'value' });
      await tasks.ImageReset.execute(context, {});

      expect(context.variables).to.deep.equal({ variable: 'value' });
      expect(context.root).to.be.null;
      expect(context.config).to.be.null;
    });
  });

  describe('ConfigInit', () => {
    it('should execute properly', async () => {
      const context = await initContext();
      await tasks.ConfigInit.execute(context, {});

      expect(formatStructure(context.root)).to.deep.equal(contentArchiveBase);
      expect(formatStructure(context.config)).to.deep.equal(contentArchiveConfig);
    });
  });

  describe('ConfigImport', () => {
    it('should execute properly', async () => {
      const context = await initContext();
      await tasks.ConfigInit.execute(context, {});

      await tasks.ConfigImport.execute(context, {
        archiveName: 'config-import.tar.gz',
      });

      expect(formatStructure(context.config)).to.deep.equal([
        ...contentArchiveConfig,
        { indent: 1, name: 'my-config', uid: 0, gid: 0, mode: 0o755, atime: null, mtime: new Date(1516872309000), ctime: null, dir: true },
        { indent: 2, name: 'my-config.conf', uid: 0, gid: 0, mode: 0o644, atime: null, mtime: new Date(1516872309000), ctime: null, length: 10 },
      ]);
    });
  });

  describe('ConfigHostname', () => {
    it('should execute properly', async () => {
      const hostname = 'test-host';
      const context = await initContext();
      await tasks.ConfigInit.execute(context, {});

      await tasks.ConfigHostname.execute(context, {
        hostname,
      });

      expectConfigContent(context, ['etc', 'hostname']);
      expectConfigContent(context, ['etc', 'network', 'interfaces']);
      expectConfigContent(context, ['etc', 'hosts']);
    });
  });

  describe('ConfigHwaddress', () => {
    it('should execute properly', async () => {
      const iface = 'eth0';
      const address = '11:22:33:44:55:66';
      const context = await initContext();
      await tasks.ConfigInit.execute(context, {});

      await tasks.ConfigHwaddress.execute(context, {
        iface,
        address,
      });

      expectConfigContent(context, ['etc', 'network', 'interfaces'], 'hwaddr');
    });
  });

  describe('ConfigWifi', () => {
    it('should execute properly', async () => {
      const context = await initContext();
      await tasks.ConfigInit.execute(context, {});

      await tasks.ConfigWifi.execute(context, {
        iface: 'wlan0',
        ssid: 'test-ssid',
        psk: '123456789abcdef',
      });

      expectConfigContent(context, ['etc', 'network', 'interfaces'], 'wifi');
      expectConfigContent(context, ['etc', 'wpa_supplicant', 'wpa_supplicant.conf']);
    });
  });

  describe('ConfigDaemon', () => {
    it('should execute properly', async () => {
      const runlevel = 'default';
      const name = 'test-daemon';
      const context = await initContext();
      await tasks.ConfigInit.execute(context, {});

      await tasks.ConfigDaemon.execute(context, {
        name,
        runlevel,
      });

      expectConfigSymlink(context, ['etc', 'runlevels', runlevel, name], `/etc/init.d/${name}`);
    });
  });

  describe('ConfigPackage', () => {
    it('should execute properly', async () => {
      const name = 'test-package';
      const context = await initContext();
      await tasks.ConfigInit.execute(context, {});

      await tasks.ConfigPackage.execute(context, {
        name,
      });

      expectConfigContent(context, ['etc', 'apk', 'world']);
    });
  });

  describe('ConfigLs', () => {
    it('should execute properly', async () => {
      const context = await initContext();
      await tasks.ConfigInit.execute(context, {});
      await tasks.ConfigLs.execute(context, { path: '/' });

      // TODO: expect logs ?
    });
  });

  describe('ConfigPack', () => {
    it('should execute properly', async () => {
      const context = await initContext({ nocache: true });
      await tasks.ConfigInit.execute(context, {});
      const node = vfs.path(context.root, ['rpi-devel.apkovl.tar.gz']) as vfs.File;
      node.content = Buffer.alloc(0); // reset config file

      await tasks.ConfigPack.execute(context, {});

      expect(node.content.length).to.equal(10603);
    });
  });

  describe('VariablesSet', () => {
    it('should execute properly', async () => {
      const context = await initContext({ noload: true });
      await tasks.VariablesSet.execute(context, { name: 'variable', value: 'value' });

      expect(context.variables).to.deep.equal({ variable: 'value' });
    });
  });

  describe('VariablesReset', () => {
    it('should execute properly', async () => {
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

let cachedRoot: vfs.Directory;

function pad(number: number) {
  return number < 10 ? '0' + number : number.toString();
}

function printDate(date: Date) {
  return date.getFullYear() + pad(date.getMonth() + 1) + pad(date.getDate()) + '-' + pad(date.getHours()) + pad(date.getMinutes()) + pad(date.getSeconds());
}

interface InitContextOptions {
  noload?: boolean;
  nocache?: boolean;
}

async function initContext(options: InitContextOptions = {}) {
  if (options.noload) {
    return createExecutionContext();
  }

  if (!options.nocache && cachedRoot) {
    return createExecutionContext({ root: cachedRoot });
  }

  const context = createExecutionContext();
  await tasks.ImageImport.execute(context, {
    archiveName: 'rpi-devel-base.tar.gz',
    rootPath: 'mmcblk0p1',
  });
  !options.nocache && (cachedRoot = context.root);
  return context;
}

type Hierarchy = { [key: string]: string | Buffer | Hierarchy };

function createHierarchy(rootfs: vfs.Directory, hierarchy: Hierarchy) {
  for (const [name, item] of Object.entries(hierarchy)) {
    if (typeof item === 'string' || item instanceof Buffer) {
      const file = new vfs.File({ name, content: item instanceof Buffer ? item : Buffer.from(item) });
      rootfs.add(file);
      continue;
    }

    const directory = new vfs.Directory({ name });
    rootfs.add(directory);
    createHierarchy(directory, item);
  }
}

async function runSshTest(hierarchy: Hierarchy, expectedHierarchy: Hierarchy, expectedCmds: { command: string; result: string }[], tester: () => Promise<any>) {
  let nextCmd = 0;

  const cmdhandler = (cmd: string) => {
    const def = expectedCmds[nextCmd++];
    expect(def.command === cmd);
    return def.result;
  };

  const rootfs = new vfs.Directory();
  createHierarchy(rootfs, hierarchy);
  const expectedRootfs = new vfs.Directory();
  createHierarchy(expectedRootfs, expectedHierarchy);

  const server = new SSHServer({
    port: 8822,
    rootfs,
    cmdhandler,
    hostKeys: [fs.readFileSync(path.resolve(__dirname, 'resources/files/id_rsa'))],
  });

  try {
    await tester();
  } finally {
    server.close();
  }

  expect(nextCmd).to.equal(expectedCmds.length);
  expect(formatStructure(rootfs)).to.deep.equal(formatStructure(expectedRootfs));
}
