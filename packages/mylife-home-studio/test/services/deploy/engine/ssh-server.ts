import { Server, SFTP_STATUS_CODE, SFTP_OPEN_MODE, ServerConfig, Connection, Session } from 'ssh2';
import { SFTPStream, FileEntry, Attributes } from 'ssh2-streams';
import * as vfs from '../../../../src/services/deploy/engine/vfs';

type Mutable<T> = {
  -readonly [P in keyof T]: T[P];
};

const S_IFMT = 0o0170000; // bit mask for the file type bit fields
const S_IFREG = 0o0100000; // regular file
const S_IFDIR = 0o0040000; // directory
const S_IFLNK = 0o0120000; // symbolic link
const S_IRUSR = 0o00400; // owner has read permission
const S_IWUSR = 0o00200; // owner has write permission
const S_IXUSR = 0o00100; // owner has execute permission
const S_IRGRP = 0o00040; // group has read permission
const S_IWGRP = 0o00020; // group has write permission
const S_IXGRP = 0o00010; // group has execute permission
const S_IROTH = 0o00004; // others have read permission
const S_IWOTH = 0o00002; // others have write permission
const S_IXOTH = 0o00001; // others have execute permission

const fileTypeLongname = new Map([
  [S_IFREG, '-'],
  [S_IFDIR, 'd'],
  [S_IFLNK, 'l'],
]);

const permtoLongname = [
  { num: S_IRUSR, value: 'r' },
  { num: S_IWUSR, value: 'w' },
  { num: S_IXUSR, value: 'x' },
  { num: S_IRGRP, value: 'r' },
  { num: S_IWGRP, value: 'w' },
  { num: S_IXGRP, value: 'x' },
  { num: S_IROTH, value: 'r' },
  { num: S_IWOTH, value: 'w' },
  { num: S_IXOTH, value: 'x' },
];

const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'July', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const sftpEvents = [
  'OPEN',
  'READ',
  'WRITE',
  'FSTAT',
  'FSETSTAT',
  'CLOSE',
  'OPENDIR',
  'READDIR',
  'LSTAT',
  'STAT',
  'REMOVE',
  'RMDIR',
  'REALPATH',
  'READLINK',
  'SETSTAT',
  'MKDIR',
  'RENAME',
  'SYMLINK',
];

export type CmdHandler = (cmd: string) => string;

export interface Config extends ServerConfig {
  port: number;
  rootfs: vfs.Directory;
  cmdhandler: CmdHandler;
}

export class SSHServer {
  private readonly rootfs: vfs.Directory;
  private readonly cmdhandler: CmdHandler;
  private readonly server: Server;
  private readonly connections = new Set<Connection>();

  constructor({ port, rootfs, cmdhandler, ...serverConfig }: Config) {
    this.rootfs = rootfs;
    this.cmdhandler = cmdhandler;
    this.server = new Server(serverConfig, this.newClient);
    this.server.listen(port);
  }

  close() {
    this.server.close();
    Array.from(this.connections).forEach((c) => c.end());
  }

  private readonly newClient = (connection: Connection) => {
    this.connections.add(connection);
    connection.on('close', () => this.connections.delete(connection));

    connection.on('authentication', (ctx) => ctx.accept());

    connection.on('ready', () => {
      connection.on('session', (accept) => this.newSession(connection, accept()));
    });
  };

  private newSession(connection: Connection, session: Session) {
    session.on('exec', (accept, reject, info) => {
      const stream = accept();
      try {
        const ret = this.cmdhandler(info.command);
        stream.write(ret);
        stream.exit(0);
      } catch (err) {
        stream.stderr.write(err.message);
        stream.exit(1);
      }
      stream.end();
    });

    session.on('sftp', (accept) => {
      const sftpStream = accept();
      const ssession = new SFTPSession(this.rootfs);

      for (const event of sftpEvents) {
        const sessionCall = ssession[event.toLowerCase() as keyof SFTPSession].bind(ssession);
        sftpStream.on(event, (reqId: number, ...args: any[]) => sessionCall(new RequestContext(connection, sftpStream, reqId), ...args));
      }
    });
  }
}

class RequestContext {
  constructor(private readonly conn: Connection, private readonly sftpStream: SFTPStream, private readonly reqId: number) {}

  async status(statusCode: number, message?: string) {
    if (this.sftpStream.status(this.reqId, statusCode, message)) {
      return;
    }

    await this.wait();
  }

  async handle(handle: Buffer) {
    if (this.sftpStream.handle(this.reqId, handle)) {
      return;
    }

    await this.wait();
  }

  async data(data: string | Buffer, encoding?: string) {
    if (this.sftpStream.data(this.reqId, data, encoding)) {
      return;
    }

    await this.wait();
  }

  async name(names: FileEntry[]) {
    if (this.sftpStream.name(this.reqId, names)) {
      return;
    }

    await this.wait();
  }

  async attrs(attrs: Attributes) {
    if (this.sftpStream.attrs(this.reqId, attrs)) {
      return;
    }

    await this.wait();
  }

  private async wait() {
    return await new Promise((resolve, reject) => {
      const removeListeners = () => {
        this.conn.removeListener('error', onError);
        this.conn.removeListener('continue', onContinue);
      };

      const onError = (err: Error) => {
        removeListeners();
        reject(err);
      };

      const onContinue = () => {
        removeListeners();
        resolve();
      };

      this.conn.once('error', onError);
      this.conn.once('continue', onContinue);
    });
  }
}

class SFTPSession {
  private readonly handleTable = new HandleTable();

  constructor(private readonly rootfs: vfs.Directory) {}

  async open(ctx: RequestContext, filename: string, flags: number, attrs: Attributes) {
    if (flags & SFTP_OPEN_MODE.APPEND) {
      return await ctx.status(SFTP_STATUS_CODE.OP_UNSUPPORTED);
    }

    const nodes = filename.split('/').filter((n) => n);
    const dir = vfs.path(this.rootfs, nodes.slice(0, nodes.length - 1), true) as vfs.Directory;
    if (!dir) {
      return await ctx.status(SFTP_STATUS_CODE.NO_SUCH_FILE);
    }
    const name = nodes[nodes.length - 1];
    let file = dir.get<vfs.File>(name);

    if (file && flags & SFTP_OPEN_MODE.CREAT && flags & SFTP_OPEN_MODE.EXCL) {
      return await ctx.status(SFTP_STATUS_CODE.FAILURE);
    }

    if (!file) {
      if (!(flags & SFTP_OPEN_MODE.CREAT)) {
        return await ctx.status(SFTP_STATUS_CODE.NO_SUCH_FILE);
      }

      const options: Mutable<Partial<vfs.File>> = { name };
      const { mode, uid, gid, atime, mtime } = attrs;
      if (typeof mode !== 'undefined') {
        options.mode = mode & 0o777;
      }
      if (typeof uid !== 'undefined') {
        options.uid = uid;
      }
      if (typeof gid !== 'undefined') {
        options.gid = gid;
      }
      if (typeof atime !== 'undefined') {
        options.atime = new Date(atime);
      }
      if (typeof mtime !== 'undefined') {
        options.mtime = new Date(mtime);
      }

      file = new vfs.File({ name });
      dir.add(file);
    }

    if (flags & SFTP_OPEN_MODE.WRITE && flags & SFTP_OPEN_MODE.TRUNC) {
      file.content = Buffer.alloc(0);
    }

    const openedFile = new OpenedFile(file, {
      readable: !!(flags & SFTP_OPEN_MODE.READ),
      writable: !!(flags & SFTP_OPEN_MODE.WRITE),
    });

    const handle = this.handleTable.create(openedFile);
    await ctx.handle(handle);
  }

  async read(ctx: RequestContext, handle: Buffer, offset: number, length: number) {
    const openedFile = this.handleTable.target(handle, OpenedFile) as OpenedFile;
    if (!openedFile) {
      return await ctx.status(SFTP_STATUS_CODE.FAILURE);
    }
    const data = openedFile.read(offset, length);
    if (!data) {
      return await ctx.status(SFTP_STATUS_CODE.FAILURE);
    }
    if (!data.length) {
      return await ctx.status(SFTP_STATUS_CODE.EOF);
    }
    await ctx.data(data);
  }

  async write(ctx: RequestContext, handle: Buffer, offset: number, data: Buffer) {
    const openedFile = this.handleTable.target(handle, OpenedFile) as OpenedFile;
    if (!openedFile) {
      return await ctx.status(SFTP_STATUS_CODE.FAILURE);
    }
    const ret = openedFile.write(offset, data);
    await ctx.status(ret ? SFTP_STATUS_CODE.OK : SFTP_STATUS_CODE.FAILURE);
  }

  async fstat(ctx: RequestContext, handle: Buffer) {
    const openedFile = this.handleTable.target(handle, OpenedFile) as OpenedFile;
    if (!openedFile) {
      return await ctx.status(SFTP_STATUS_CODE.FAILURE);
    }
    await ctx.attrs(openedFile.stat());
  }

  async fsetstat(ctx: RequestContext, handle: Buffer, attrs: Attributes) {
    void ctx, handle, attrs;
    await ctx.status(SFTP_STATUS_CODE.OP_UNSUPPORTED);
  }

  async close(ctx: RequestContext, handle: Buffer) {
    const ret = this.handleTable.delete(handle);
    await ctx.status(ret ? SFTP_STATUS_CODE.OK : SFTP_STATUS_CODE.FAILURE);
  }

  async opendir(ctx: RequestContext, path: string) {
    const node = vfs.path(
      this.rootfs,
      path.split('/').filter((n) => n),
      true
    );
    if (!node) {
      return await ctx.status(SFTP_STATUS_CODE.NO_SUCH_FILE);
    }

    if (!(node instanceof vfs.Directory)) {
      return await ctx.status(SFTP_STATUS_CODE.NO_SUCH_FILE);
    }

    const openedDirectory = new OpenedDirectory(node);
    const handle = this.handleTable.create(openedDirectory);
    await ctx.handle(handle);
  }

  async readdir(ctx: RequestContext, handle: Buffer) {
    const openedDirectory = this.handleTable.target(handle, OpenedDirectory) as OpenedDirectory;
    if (!openedDirectory) {
      return await ctx.status(SFTP_STATUS_CODE.FAILURE);
    }

    if (openedDirectory.eof) {
      return await ctx.status(SFTP_STATUS_CODE.EOF);
    }

    await ctx.name(openedDirectory.content());
  }

  async lstat(ctx: RequestContext, path: string) {
    void ctx, path;
    await ctx.status(SFTP_STATUS_CODE.OP_UNSUPPORTED);
  }

  async stat(ctx: RequestContext, path: string) {
    void ctx, path;
    await ctx.status(SFTP_STATUS_CODE.OP_UNSUPPORTED);
  }

  async remove(ctx: RequestContext, path: string) {
    await this.removeByType(ctx, path, false);
  }

  async rmdir(ctx: RequestContext, path: string) {
    await this.removeByType(ctx, path, true);
  }

  private async removeByType(ctx: RequestContext, path: string, isdir: boolean) {
    const nodes = path.split('/').filter((n) => n);
    const dir = vfs.path(this.rootfs, nodes.slice(0, nodes.length - 1), true) as vfs.Directory;
    if (!dir) {
      return await ctx.status(SFTP_STATUS_CODE.NO_SUCH_FILE);
    }

    const node = dir.get(nodes[nodes.length - 1]);
    if (!node) {
      return await ctx.status(SFTP_STATUS_CODE.NO_SUCH_FILE);
    }
    if (xor(isdir, node instanceof vfs.Directory)) {
      return await ctx.status(SFTP_STATUS_CODE.NO_SUCH_FILE);
    }

    dir.delete(node);
    await ctx.status(SFTP_STATUS_CODE.OK);
  }

  async realpath(ctx: RequestContext, path: string) {
    void ctx, path;
    await ctx.status(SFTP_STATUS_CODE.OP_UNSUPPORTED);
  }

  async readlink(ctx: RequestContext, path: string) {
    void ctx, path;
    await ctx.status(SFTP_STATUS_CODE.OP_UNSUPPORTED);
  }

  async setstat(ctx: RequestContext, path: string, attrs: Attributes) {
    void ctx, path, attrs;
    await ctx.status(SFTP_STATUS_CODE.OP_UNSUPPORTED);
  }

  async mkdir(ctx: RequestContext, path: string, attrs: Attributes) {
    const nodes = path.split('/').filter((n) => n);
    const dir = vfs.path(this.rootfs, nodes.slice(0, nodes.length - 1), true) as vfs.Directory;
    if (!dir) {
      return await ctx.status(SFTP_STATUS_CODE.NO_SUCH_FILE);
    }
    const name = nodes[nodes.length - 1];
    if (dir.get(name)) {
      return await ctx.status(SFTP_STATUS_CODE.FAILURE);
    }

    const options: Mutable<Partial<vfs.Node>> = { name };
    if (attrs) {
      if (typeof attrs.uid !== 'undefined') {
        options.uid = attrs.uid;
      }
      if (typeof attrs.gid !== 'undefined') {
        options.gid = attrs.gid;
      }
      if (typeof attrs.mode !== 'undefined') {
        options.mode = attrs.mode & 0o777;
      }
    }

    const newDir = new vfs.Directory(options);
    dir.add(newDir);
    await ctx.status(SFTP_STATUS_CODE.OK);
  }

  async rename(ctx: RequestContext, oldPath: string, newPath: string) {
    const oldNodes = oldPath.split('/').filter((n) => n);
    const oldDir = vfs.path(this.rootfs, oldNodes.slice(0, oldNodes.length - 1), true) as vfs.Directory;
    if (!oldDir) {
      return await ctx.status(SFTP_STATUS_CODE.NO_SUCH_FILE);
    }
    const oldName = oldNodes[oldNodes.length - 1];

    const newNodes = newPath.split('/').filter((n) => n);
    const newDir = vfs.path(this.rootfs, newNodes.slice(0, newNodes.length - 1), true) as vfs.Directory;
    if (!newDir) {
      return await ctx.status(SFTP_STATUS_CODE.NO_SUCH_FILE);
    }
    const newName = newNodes[newNodes.length - 1];

    const node = oldDir.get(oldName);
    if (!node) {
      return await ctx.status(SFTP_STATUS_CODE.NO_SUCH_FILE);
    }
    if (newDir.get(newName)) {
      return await ctx.status(SFTP_STATUS_CODE.FAILURE);
    }

    oldDir.delete(node);
    // this is hacky, we by-pass readonly
    (node as Mutable<vfs.Node>).name = newName;
    newDir.add(node);
    await ctx.status(SFTP_STATUS_CODE.OK);
  }

  async symlink(ctx: RequestContext, linkPath: string, targetPath: string) {
    void ctx, linkPath, targetPath;
    await ctx.status(SFTP_STATUS_CODE.OP_UNSUPPORTED);
  }
}

class HandleTable {
  private generator = 0;
  private readonly map = new Map<number, OpenedFile | OpenedDirectory>();

  create(target: OpenedFile | OpenedDirectory) {
    const id = ++this.generator;
    this.map.set(id, target);
    return this.bufferFromInt(id);
  }

  target(handle: Buffer, Type: typeof OpenedFile | typeof OpenedDirectory) {
    const id = this.bufferToInt(handle);
    const ret = this.map.get(id);
    if (ret instanceof Type) {
      return ret;
    }
  }

  delete(handle: Buffer) {
    const id = this.bufferToInt(handle);
    return this.map.delete(id);
  }

  private bufferToInt(buffer: Buffer) {
    return buffer.readUInt32LE(0);
  }

  private bufferFromInt(value: number) {
    const buffer = Buffer.allocUnsafe(4);
    buffer.writeUInt32LE(value, 0);
    return buffer;
  }
}

class OpenedFile {
  private readonly readable: boolean;
  private readonly writable: boolean;

  constructor(private readonly node: vfs.File, { readable = false, writable = false }: { readable: boolean; writable: boolean }) {
    this.readable = readable;
    this.writable = writable;
  }

  write(offset: number, data: Buffer) {
    if (!this.writable) {
      return;
    }

    // resize needed ?
    const requiredLength = offset + data.length;
    if (requiredLength > this.node.content.length) {
      const buffer = Buffer.alloc(requiredLength);
      this.node.content.copy(buffer);
      this.node.content = buffer;
    }

    data.copy(this.node.content, offset);
    return true;
  }

  read(offset: number, length: number) {
    if (!this.readable) {
      return;
    }
    return this.node.content.slice(offset, offset + length);
  }

  stat() {
    const { uid, gid, atime, mtime } = this.node;
    const mode = this.node.mode + S_IFREG;
    const size = this.node.content.length;
    return { mode, size, uid, gid, atime: dateToNumber(atime), mtime: dateToNumber(mtime) };
  }
}

class OpenedDirectory {
  private _eof = false;
  constructor(private readonly node: vfs.Directory) {}

  public get eof() {
    return this._eof;
  }

  content() {
    if (this._eof) {
      return [];
    }

    this._eof = true;

    return this.node.list().map((node) => {
      let mode = node.mode;
      if (node instanceof vfs.File) {
        mode += S_IFREG;
      }
      if (node instanceof vfs.Directory) {
        mode += S_IFDIR;
      }
      if (node instanceof vfs.Symlink) {
        mode += S_IFLNK;
      }

      let size = 0;
      if (node instanceof vfs.File) {
        size = node.content.length;
      }
      if (node instanceof vfs.Symlink) {
        size = node.target.length;
      }

      const { uid, gid, atime, mtime } = node;
      const date = new Date(mtime);

      let longname = fileTypeLongname.get(mode & S_IFMT) || ' ';
      for (const item of permtoLongname) {
        longname += mode & item.num ? item.value : '-';
      }

      longname += ' 1';
      longname += ' ' + uid.toString().padEnd(8);
      longname += ' ' + gid.toString().padEnd(8);
      longname += ' ' + size.toString().padStart(12);
      longname += ' ' + monthNames[date.getMonth()];
      longname += ' ' + date.getDate().toString().padStart(2);
      longname += ' ' + date.getHours().toString().padStart(2, '0');
      longname += ':' + date.getMinutes().toString().padStart(2, '0');
      longname += ' ' + node.name;

      if (node instanceof vfs.Symlink) {
        longname += ' -> ' + node.target;
      }

      return {
        filename: node.name,
        attrs: { mode, size, uid, gid, atime: dateToNumber(atime), mtime: dateToNumber(mtime) },
        longname,
      };
    });
  }
}

function xor(a: boolean, b: boolean) {
  return (a && !b) || (!a && b);
}

function dateToNumber(date: Date) {
  return date && date.valueOf();
}
