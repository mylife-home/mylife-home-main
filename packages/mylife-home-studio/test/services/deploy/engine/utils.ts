import { expect } from 'chai';
import * as vfs from '../../../../src/services/deploy/engine/vfs';
import { ExecutionContext } from '../../../../src/services/deploy/engine/recipe';
import contents from './content/files';

export interface NodeLine {
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

export function printLines(lines: NodeLine[]) {
  for(const l of lines) {
    let line = `  { indent: ${l.indent}, name: '${l.name}', `;
    line = line.padEnd(70);
    line += `uid: ${l.uid}, gid: ${l.gid}, mode: 0o${l.mode.toString(8)}, atime: ${printDate(l.atime)}, mtime: ${printDate(l.mtime)}, ctime: ${printDate(l.ctime)}`;
    if (l.hasOwnProperty('dir')) {
      line += ', dir: true';
    }
    if (l.hasOwnProperty('length')) {
      line += `, length: ${l.length}`;
    }
    if (l.hasOwnProperty('target')) {
      line += `, target: '${l.target}'`;
    }
    if (l.hasOwnProperty('missing')) {
      line += `, missing: ${l.missing}`;
    }
    line += ' },';

    console.log(line); // eslint-disable-line no-console
  }
}

export function formatStructure(root: vfs.Directory) {
  const lines = [];
  formatDirectory(lines, root, 0);
  return lines;
}

function formatDirectory(lines: NodeLine[], vdir: vfs.Directory, indent: number) {
  for (const vnode of vdir.list()) {
    const output: NodeLine = {
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

export function expectConfigContent(context: ExecutionContext, path: string[], suffix: string) {
  expect(vfs.readText(context.config, path)).to.equal(contents[path.join('-') + (suffix ? '-' + suffix : '')]);
}

export function expectConfigSymlink(context: ExecutionContext, path: string[], target: string) {
  const node = vfs.path(context.config, path);
  expect(node).to.be.an.instanceof(vfs.Symlink);
  expect((node as vfs.Symlink).target).to.equal(target);
}

export async function expectFail(test: () => Promise<void>, match: RegExp) {
  let err;
  try {
    await test();
  } catch (exc) {
    err = exc;
  }
  expect(err).to.match(match);
}
