import zlib from 'zlib';
import path from 'path';
import tar from 'tar-stream';
import * as vfs from './vfs';
import { BufferReader, BufferWriter, apipe } from './buffers';
import { Stream } from 'stream';

type NextCallback = (err?: Error) => void;

export type Options = { baseDirectory?: string };

// extract buffer into directory
export async function extract(buffer: Buffer, directory: vfs.Directory, { baseDirectory = '' }: Options = {}) {
  const extract = tar.extract();

  extract.on('entry', (header, stream, next: NextCallback) => {
    let name = header.name;
    // find directory this item belongs to and its name
    name = path.relative(baseDirectory, name);
    const { dir, base } = path.parse(name);
    let vdir = directory;

    dir &&
      dir.split('/').forEach((node) => {
        const existing = vdir.get<vfs.Directory>(node);
        if (existing) {
          vdir = existing;
          return;
        }

        const newChild = new vfs.Directory({ name: node, missing: true });
        vdir.add(newChild);
        vdir = newChild;
      });

    switch (header.type) {
      case 'directory':
        extractDirectory(vdir, base, header);
        // empty stream
        stream.on('end', next);
        stream.resume();
        break;

      case 'file':
        extractFile(vdir, base, header, stream, next);
        break;

      case 'symlink':
        extractSymlink(vdir, base, header);
        // empty stream
        stream.on('end', next);
        stream.resume();
        break;

      default:
        return next(new Error(`Unknown entry type : ${header.type}`));
    }
  });

  await apipe(new BufferReader(buffer), zlib.createGunzip(), extract);
}

function extractDirectory(vdir: vfs.Directory, name: string, header: tar.Headers) {
  if (!name) {
    // creation of './' in archive
    return;
  }
  if (vdir.get(name)) {
    return; // do not overwrite directories
  }
  const directory = new vfs.Directory({ name, ...headerToNodeOptions(header) });
  vdir.add(directory);
}

function extractFile(vdir: vfs.Directory, name: string, header: tar.Headers, stream: Stream, next: NextCallback) {
  const file = new vfs.File({ name, ...headerToNodeOptions(header) });
  vdir.add(file);

  const bw = new BufferWriter();
  bw.once('finish', () => {
    file.content = bw.getBuffer();
    next();
  });
  stream.pipe(bw);
}

function extractSymlink(vdir: vfs.Directory, name: string, header: tar.Headers) {
  const symlink = new vfs.Symlink({ name, target: header.linkname, ...headerToNodeOptions(header) });
  vdir.add(symlink);
}

// pack directory and returns buffer
export async function pack(directory: vfs.Directory, { baseDirectory = '' }: Options = {}) {
  const pack = tar.pack();

  const writer = new BufferWriter();

  await Promise.all([apipe(pack, zlib.createGzip(), writer), packArchive(pack, directory, baseDirectory)]);

  return writer.getBuffer();
}

async function packArchive(pack: tar.Pack, directory: vfs.Directory, baseDirectory: string) {
  await packDirectory(pack, directory, baseDirectory);
  pack.finalize();
}

function packFile(pack: tar.Pack, file: vfs.File, baseDirectory: string) {
  return new Promise((resolve, reject) => {
    const header = nodeToHeader(file, baseDirectory);
    header.size = file.content.length;
    header.type = 'file';
    const entry = pack.entry(header, (err) => (err ? reject(err) : resolve()));
    new BufferReader(file.content).pipe(entry);
  });
}

async function packDirectory(pack: tar.Pack, directory: vfs.Directory, baseDirectory: string) {
  if (!directory.missing) {
    const header = nodeToHeader(directory, baseDirectory);
    header.type = 'directory';
    pack.entry(header);
  }

  const childBaseDirectory = path.join(baseDirectory, directory.name);

  for (const node of directory.list()) {
    if (node instanceof vfs.File) {
      await packFile(pack, node, childBaseDirectory);
      continue;
    }

    if (node instanceof vfs.Directory) {
      await packDirectory(pack, node, childBaseDirectory);
      continue;
    }

    if (node instanceof vfs.Symlink) {
      await packSymlink(pack, node, childBaseDirectory);
      continue;
    }

    throw new Error('Unknown node type');
  }
}

async function packSymlink(pack: tar.Pack, symlink: vfs.Symlink, baseDirectory: string) {
  const header = nodeToHeader(symlink, baseDirectory);
  header.type = 'symlink';
  header.linkname = symlink.target;
  pack.entry(header);
}

function headerToNodeOptions(header: tar.Headers): vfs.NodeOptions {
  return {
    mode: header.mode,
    uid: header.uid,
    gid: header.gid,
    mtime: header.mtime === undefined ? null : header.mtime,
  };
}

function nodeToHeader(node: vfs.Node, baseDirectory: string): tar.Headers {
  const header: tar.Headers = {
    name: path.join(baseDirectory, node.name),
    mode: node.mode,
    uid: node.uid,
    gid: node.gid,
  };

  if (node.mtime !== null) {
    header.mtime = node.mtime;
  }

  return header;
}
