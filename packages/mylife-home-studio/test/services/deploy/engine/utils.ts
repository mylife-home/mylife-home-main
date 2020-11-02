import path from 'path';
import { expect } from 'chai';
import { tools } from 'mylife-home-common';
import * as vfs from '../../../../src/services/deploy/engine/vfs';
import { ExecutionContext } from '../../../../src/services/deploy/engine/recipe';
import contents from './content/files';
import { RunLogSeverity } from '../../../../src/services/deploy/engine/manager';
import * as directories from '../../../../src/services/deploy/directories';
import { Config } from '../../../../src/services/deploy/config';

export interface FormattedNode {
  indent: number;
  name: string;
  uid: number;
  gid: number;
  mode: number;
  atime: Date;
  mtime: Date;
  ctime: Date;
  missing?: boolean;
  dir?: boolean;
  length?: number;
  target?: string;
}

function printDate(date: Date) {
  return date ? `new Date(${date.valueOf()})` : 'null';
}

export function printLines(lines: FormattedNode[]) {
  for(const line of lines) {
    let text = `  { indent: ${line.indent}, name: '${line.name}', `;
    text = text.padEnd(70);
    text += `uid: ${line.uid}, gid: ${line.gid}, mode: 0o${line.mode.toString(8)}, atime: ${printDate(line.atime)}, mtime: ${printDate(line.mtime)}, ctime: ${printDate(line.ctime)}`;
    if (line.hasOwnProperty('dir')) {
      text += ', dir: true';
    }
    if (line.hasOwnProperty('length')) {
      text += `, length: ${line.length}`;
    }
    if (line.hasOwnProperty('target')) {
      text += `, target: '${line.target}'`;
    }
    if (line.hasOwnProperty('missing')) {
      text += `, missing: ${line.missing}`;
    }
    text += ' },';

    console.log(text); // eslint-disable-line no-console
  }
}

export function formatStructure(root: vfs.Directory) {
  const lines: FormattedNode[] = [];
  formatDirectory(lines, root, 0);
  return lines;
}

function formatDirectory(lines: FormattedNode[], vdir: vfs.Directory, indent: number) {
  for (const vnode of vdir.list()) {
    const output: FormattedNode = {
      indent,
      name: vnode.name,
      uid: vnode.uid,
      gid: vnode.gid,
      mode: vnode.mode,
      atime: vnode.atime,
      mtime: vnode.mtime,
      ctime: vnode.ctime,
    };

    if (vnode instanceof vfs.Directory) {
      if (vnode.missing) {
        output.missing = true;
      }
      output.dir = true;
      lines.push(output);
      formatDirectory(lines, vnode, indent + 1);
      continue;
    }

    if (vnode instanceof vfs.File) {
      output.length = vnode.content.length;
    } else if (vnode instanceof vfs.Symlink) {
      output.target = vnode.target;
    }
    lines.push(output);
  }
}

export function expectConfigContent(context: ExecutionContext, path: string[], suffix?: string) {
  expect(vfs.readText(context.config, path)).to.equal(contents[path.join('-') + (suffix ? '-' + suffix : '')]);
}

export function expectConfigSymlink(context: ExecutionContext, path: string[], target: string) {
  const node = vfs.path(context.config, path);
  expect(node).to.be.an.instanceof(vfs.Symlink);
  expect((node as vfs.Symlink).target).to.equal(target);
}

export async function expectFail(test: () => Promise<any>, match: RegExp) {
  let err;
  try {
    await test();
  } catch (exc) {
    err = exc;
  }
  expect(err).to.match(match);
}

export function logger(category: string, severity: RunLogSeverity, message: string) {
  process.env.VERBOSE === '1' && console.log(`${severity} : [${category}] ${message}`); // eslint-disable-line no-console
}

export function createExecutionContext(params?: Partial<ExecutionContext>): ExecutionContext {
  return { logger, root: null, config: null, variables: null, ...params };
}

export function setupDataDirectory(dataDir: string) {
  const config: Config = {
    filesPath: path.join(dataDir, 'files'),
    recipesPath: path.join(dataDir, 'recipes')
  };

  tools.injectConfig({ deploy: config });

  directories.configure();
}