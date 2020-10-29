'use strict';

const { expect } = require('chai');
const vfs        = require('../../lib/engine/vfs');
const contents   = require('./content/files');

function printDate(date) {
  return date ? `new Date(${date.valueOf()})` : 'null';
}

function printLines(lines) {
  lines.forEach(l => {
    let line = `  { indent: ${l.indent}, name: '${l.name}', `;
    line = line.padEnd(70);
    line += `uid: ${l.uid}, gid: ${l.gid}, mode: 0o${l.mode.toString(8)}, atime: ${printDate(l.atime)}, mtime: ${printDate(l.mtime)}, ctime: ${printDate(l.ctime)}`;
    if(l.hasOwnProperty('dir')) {
      line += ', dir: true';
    }
    if(l.hasOwnProperty('length')) {
      line += `, length: ${l.length}`;
    }
    if(l.hasOwnProperty('target')) {
      line += `, target: '${l.target}'`;
    }
    if(l.hasOwnProperty('missing')) {
      line += `, missing: ${l.missing}`;
    }
    line += ' },';

    console.log(line); // eslint-disable-line no-console
  });
}

function formatStructure(root) {
  const lines = [];
  formatDirectory(lines, root, 0);
  return lines;
}

function formatDirectory(lines, vdir, indent) {
  for(const vnode of vdir.list()) {
    const output = {
      indent,
      name  : vnode.name,
      uid   : vnode.uid,
      gid   : vnode.gid,
      mode  : vnode.mode,
      atime : vnode.atime,
      mtime : vnode.mtime,
      ctime : vnode.ctime
    };

    if(vnode instanceof vfs.Directory) {
      if(vnode.missing) { output.missing = true; }
      output.dir = true;
      lines.push(output);
      formatDirectory(lines, vnode, indent + 1);
      continue;
    }

    if(vnode instanceof vfs.File) {
      output.length = vnode.content.length;
    } else if(vnode instanceof vfs.Symlink) {
      output.target = vnode.target;
    }
    lines.push(output);
  }
}

function expectConfigContent(context, path, suffix) {
  expect(vfs.readText(context.config, path)).to.equal(contents[path.join('-') + (suffix ? '-' + suffix : '')]);
}

function expectConfigSymlink(context, path, target) {
  const node = vfs.path(context.config, path);
  expect(node).to.be.an.instanceof(vfs.Symlink);
  expect(node.target).to.equal(target);
}

async function expectFail(test, match) {
  let err;
  try {
    await test();
  } catch(exc) {
    err = exc;
  }
  expect(err).to.match(match);
}

exports.printLines          = printLines;
exports.formatStructure     = formatStructure;
exports.expectConfigContent = expectConfigContent;
exports.expectConfigSymlink = expectConfigSymlink;
exports.expectFail          = expectFail;
