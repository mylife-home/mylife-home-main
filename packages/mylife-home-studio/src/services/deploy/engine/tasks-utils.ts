import path from 'path';
import * as vfs from './vfs';
import * as directories from '../directories';
import { ExecutionContext } from './recipe';

export interface TaskMetadata {
  description: string;
  parameters: {
    name: string;
    description: string;
    type: 'string';
    default?: any;
  }[];
}

export type TaskImplementation = (context: ExecutionContext, parameters: { [key: string]: any }) => Promise<void>;

export function singleRowFileUpdate(root: vfs.Directory, nodes: string[], updater: (content: string) => string) {
  let content = '';
  if (vfs.path(root, nodes, true)) {
    content = vfs.readText(root, nodes);
  }

  const endNewline = content.endsWith('\n');
  if (endNewline) {
    content = content.substring(0, content.length - 1);
  }

  content = updater(content);

  if (endNewline) {
    content += '\n';
  }

  vfs.writeText(root, nodes, content);
}

export function fileAppendLine(root: vfs.Directory, nodes: string[], line: string) {
  let content = '';
  if (vfs.path(root, nodes, true)) {
    content = vfs.readText(root, nodes);
    if (!content.endsWith('\n')) {
      content += '\n';
    }
  }
  content += line + '\n';
  vfs.writeText(root, nodes, content);
}

// used by several tasks
export function configAddPackage(logger: Logger, context: ExecutionContext, name: string) {
  fileAppendLine(context.config, ['etc', 'apk', 'world'], name);
  logger.debug(`config: add '${name}' to '/etc/apk/world'`);
}

export interface Logger {
  debug(msg: string): void;
  info(msg: string): void;
  warning(msg: string): void;
  error(msg: string): void;
}

export function createLogger(context: ExecutionContext, category: string): Logger {
  return {
    debug: (msg: string) => context.logger(category, 'debug', msg),
    info: (msg: string) => context.logger(category, 'info', msg),
    warning: (msg: string) => context.logger(category, 'warning', msg),
    error: (msg: string) => context.logger(category, 'error', msg),
  };
}

export function absolutePath(p: string) {
  return path.join(directories.files(), p);
}

// used by several tasks
export function directoryLs(logger: Logger, root: vfs.Directory, path: string) {
  const nodes = path.split('/').filter((n) => n);
  const dir = vfs.path(root, nodes);

  if (!dir) {
    logger.warning(`directory '${path}' does not exist`);
    return;
  }

  if (!(dir instanceof vfs.Directory)) {
    logger.warning(`node '${path}' is not a directory`);
    return;
  }

  for (const node of dir.list()) {
    const attributes = [`uid: ${node.uid}`, `gid: ${node.gid}`, `mode: 0o${node.mode.toString(8)}`];

    if (node.mtime) {
      attributes.push(`mtime: ${node.mtime.toLocaleString()}`);
    }

    if (node instanceof vfs.File) {
      attributes.unshift('file');
      attributes.push(`size: ${node.content.length}`);
    }

    if (node instanceof vfs.Directory) {
      attributes.unshift('directory');
    }

    if (node instanceof vfs.Symlink) {
      attributes.unshift('symlink');
      attributes.push(`target: ${node.target}`);
    }

    logger.debug(`${node.name} (${attributes.join(', ')})`);
  }
}
