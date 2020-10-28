const validation = {
  positiveOrZeroInteger : val => (Number.isInteger(val) && val >= 0),
  string                : val => (typeof val === 'string'),
  dateOrNull            : val => (val === null || (val instanceof Date && !isNaN(val))),
  buffer                : val => (val instanceof Buffer),
  boolean               : val => (typeof val === 'boolean')
};

const defineProperty = (object, name, initialValue, validator) => {

  let propertyValue = initialValue;

  Object.defineProperty(object, name, {
    enumerable: true,
    get : () => propertyValue,
    set : value => {
      if(validator && !validator(value)) {
        throw new Error(`Cannot set '${value}' into '${name}'`);
      }
      return propertyValue = value;
    }
  });
};

function finalize(object, options) {
  Object.freeze(object);

  if(!options) { return; }
  for(let key of Object.keys(object)) {
    if(options.hasOwnProperty(key)) {
      object[key] = options[key];
    }
  }

  if(!object.missing && !object.name) {
    throw new Error('name required');
  }
}

class Node {

  constructor() {
    if (this.constructor === Node) {
      throw new Error('Cannot instantiate Node');
    }

    defineProperty(this, 'uid',  0, validation.positiveOrZeroInteger);
    defineProperty(this, 'gid',  0, validation.positiveOrZeroInteger);
    defineProperty(this, 'mode', 0, validation.positiveOrZeroInteger);
    defineProperty(this, 'name', '', validation.string);
    defineProperty(this, 'atime', null, validation.dateOrNull);
    defineProperty(this, 'mtime', null, validation.dateOrNull);
    defineProperty(this, 'ctime', null, validation.dateOrNull);
  }
}

class Symlink extends Node {

  constructor(options) {
    super();

    defineProperty(this, 'target', '', validation.string);

    this.mode = 0o777;

    finalize(this, options);
  }
}

class Directory extends Node {

  constructor(options) {
    super();

    const nodes = new Map();

    defineProperty(this, 'missing', false, validation.boolean);

    this.add = node => {
      if(!(node instanceof Node)) {
        throw new Error(`cannot add node '${node}'`);
      }
      nodes.set(node.name, node);
    };

    this.delete = node => nodes.delete(node.name);
    this.list   = () => Array.from(nodes.values());
    this.clear  = () => nodes.clear();
    this.get    = name => nodes.get(name);

    this.mode = 0o755;

    finalize(this, options);
  }
}

class File extends Node {

  constructor(options) {
    super();

    defineProperty(this, 'content', Buffer.alloc(0), validation.buffer);

    this.mode = 0o644;

    finalize(this, options);
  }
}

function path(root, nodes, nothrow = false) {
  let node = root;
  for(const name of nodes) {
    let child = node.get(name);
    if(!child) {
      if(nothrow) { return; }
      throw new Error(`'${name}' not found in '${node.name}'`);
    }
    node = child;
  }
  return node;
}

function readText(root, nodes) {
  const file = path(root, nodes);
  return file.content.toString('ascii');
}

function writeText(root, nodes, content) {
  const dir = path(root, nodes.slice(0, nodes.length - 1));
  const name = nodes[nodes.length - 1];
  let file = dir.get(name);
  if(!file) {
    file = new File({ name });
    dir.add(file);
  }

  file.content = Buffer.from(content, 'ascii');
}

function mkdirp(root, nodes) {
  let node = root;
  for(const name of nodes) {
    let child = node.get(name);
    if(!child) {
      child = new Directory({ name });
      node.add(child);
    }

    if(!(child instanceof Directory)) {
      throw new Error('Wrong node type');
    }

    node = child;
  }

  return node;
}

exports.Symlink   = Symlink;
exports.Directory = Directory;
exports.File      = File;
exports.path      = path;
exports.readText  = readText;
exports.writeText = writeText;
exports.mkdirp    = mkdirp;
