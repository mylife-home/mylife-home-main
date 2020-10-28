import path from 'path';
const vfs         = require('./vfs');
const directories = require('../directories');

exports.singleRowFileUpdate = (root, nodes, updater) => {
  let content = '';
  if(vfs.path(root, nodes, true)) {
    content = vfs.readText(root, nodes);
  }

  const endNewline = content.endsWith('\n');
  if(endNewline) {
    content = content.substring(0, content.length - 1);
  }

  content = updater(content);

  if(endNewline) {
    content += '\n';
  }

  vfs.writeText(root, nodes, content);
};

function fileAppendLine(root, nodes, line) {
  let content = '';
  if(vfs.path(root, nodes, true)) {
    content = vfs.readText(root, nodes);
    if(!content.endsWith('\n')) {
      content += '\n';
    }
  }
  content += line + '\n';
  vfs.writeText(root, nodes, content);
}

exports.fileAppendLine = fileAppendLine;

// used by several tasks
exports.configAddPackage = (log, context, name) => {
  fileAppendLine(context.config, [ 'etc', 'apk', 'world' ], name);
  log.debug(`config: add '${name}' to '/etc/apk/world'`);
};

exports.createLogger = (context, category) => {
  return {
    debug   : msg => context.logger(category, 'debug',   msg),
    info    : msg => context.logger(category, 'info',    msg),
    warning : msg => context.logger(category, 'warning', msg),
    error   : msg => context.logger(category, 'error',   msg)
  };
};

exports.absolutePath = p => path.join(directories.files(), p);

// used by several tasks
exports.directoryLs = (log, root, path) => {
  const dir = vfs.path(root, path.split('/').filter(n => n));
  if(!dir) {
    log.warning(`directory '${path}' does not exist`);
    return;
  }
  if(!(dir instanceof vfs.Directory)) {
    log.warning(`node '${path}' is not a directory`);
    return;
  }

  for(const node of dir.list()) {
    const attributes = [
      `uid: ${node.uid}`,
      `gid: ${node.gid}`,
      `mode: 0o${node.mode.toString(8)}`
    ];

    if(node.mtime) {
      attributes.push(`mtime: ${node.mtime.toLocaleString()}`);
    }

    if(node instanceof vfs.File) {
      attributes.unshift('file');
      attributes.push(`size: ${node.content.length}`);
    }

    if(node instanceof vfs.Directory) {
      attributes.unshift('directory');
    }

    if(node instanceof vfs.Symlink) {
      attributes.unshift('symlink');
      attributes.push(`target: ${node.target}`);
    }

    log.debug(`${node.name} (${attributes.join(', ')})`);
  }
};
