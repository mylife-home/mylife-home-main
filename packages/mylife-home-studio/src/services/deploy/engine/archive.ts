import zlib from 'zlib';
import path from 'path';
import tar from 'tar-stream';
const vfs  = require('./vfs');
const {
  BufferReader,
  BufferWriter,
  apipe
} = require('./buffers');

// extract buffer into directory
exports.extract = async (buffer, directory, options = {}) => {
  const extract = tar.extract();
  const { baseDirectory } = options;

  extract.on('entry', (header, stream, next) => {
    let name = header.name;
    // find directory this item belongs to and its name
    name = path.relative(baseDirectory || '', name);
    const { dir, base } = path.parse(name);
    let vdir = directory;

    dir && dir.split('/').forEach(node => {
      let child = vdir.get(node);
      if(child) {
        vdir = child;
        return;
      }

      child = new vfs.Directory({ name: node, missing: true });
      vdir.add(child);
      vdir = child;
    });

    switch(header.type) {

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
};

function headerToNode(header, node) {
  node.mode  = header.mode;
  node.uid   = header.uid;
  node.gid   = header.gid;
  node.mtime = typeof header.mtime === 'undefined' ? null : header.mtime;
  node.atime = typeof header.atime === 'undefined' ? null : header.atime;
  node.ctime = typeof header.ctime === 'undefined' ? null : header.ctime;
}

function nodeToHeader(node, baseDirectory) {
  const header = {
    name : path.join(baseDirectory, node.name),
    mode : node.mode,
    uid  : node.uid,
    gid  : node.gid
  };

  if(node.mtime !== null) { header.mtime = node.mtime; }
  if(node.atime !== null) { header.atime = node.atime; }
  if(node.ctime !== null) { header.ctime = node.ctime; }

  return header;
}

function extractDirectory(vdir, name, header) {
  if(!name) {
    // creation of './' in archive
    return;
  }
  if(vdir.get(name)) {
    return; // do not overwrite directories
  }
  const directory = new vfs.Directory({ name });
  headerToNode(header, directory);
  vdir.add(directory);
}

function extractFile(vdir, name, header, stream, next) {

  const file = new vfs.File({ name });
  headerToNode(header, file);
  vdir.add(file);

  const bw = new BufferWriter();
  bw.once('finish', () => {
    file.content = bw.getBuffer();
    next();
  });
  stream.pipe(bw);
}

function extractSymlink(vdir, name, header) {
  const symlink = new vfs.Symlink({ name, target: header.linkname });
  headerToNode(header, symlink);
  vdir.add(symlink);
}

// pack directory and returns buffer
exports.pack = async (directory, options = {}) => {
  const pack = tar.pack();
  const { baseDirectory } = options;

  const writer = new BufferWriter();

  await Promise.all([
    apipe(pack, zlib.createGzip(), writer),
    packArchive(pack, directory, baseDirectory || '')
  ]);

  return writer.getBuffer();
};

async function packArchive(pack, directory, baseDirectory) {
  await packDirectory(pack, directory, baseDirectory);
  pack.finalize();
}

function packFile(pack, file, baseDirectory) {
  return new Promise((resolve, reject) => {
    const header = nodeToHeader(file, baseDirectory);
    header.size  = file.content.length;
    header.type  = 'file';
    const entry  = pack.entry(header, err => (err ? reject(err) : resolve()));
    new BufferReader(file.content).pipe(entry);
  });
}

async function packDirectory(pack, directory, baseDirectory) {
  if(!directory.missing) {
    const header = nodeToHeader(directory, baseDirectory);
    header.type = 'directory';
    pack.entry(header);
  }

  const childBaseDirectory = path.join(baseDirectory, directory.name);

  for(const node of directory.list()) {
    if(node instanceof vfs.File) {
      await packFile(pack, node, childBaseDirectory);
      continue;
    }

    if(node instanceof vfs.Directory) {
      await packDirectory(pack, node, childBaseDirectory);
      continue;
    }

    if(node instanceof vfs.Symlink) {
      await packSymlink(pack, node, childBaseDirectory);
      continue;
    }

    throw new Error('Unknown node type');
  }
}

async function packSymlink(pack, symlink, baseDirectory) {
  const header    = nodeToHeader(symlink, baseDirectory);
  header.type     = 'symlink';
  header.linkname = symlink.target;
  pack.entry(header);
}