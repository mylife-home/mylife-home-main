export abstract class Node {
  public readonly uid: number = 0;
  public readonly gid: number = 0;
  public readonly mode: number = 0;
  public readonly name: string = '';
  public readonly atime: Date = null;
  public readonly mtime: Date = null;
  public readonly ctime: Date = null;
}

export type NodeOptions = Partial<Node>;

export class Symlink extends Node {
  public readonly target: string = '';

  constructor(options: Partial<Symlink>) {
    super();

    init(this, null, options);
  }
}

export class File extends Node {
  public content = Buffer.alloc(0);

  constructor(options: Partial<File>) {
    super();
    init(this, { mode: 0o644 }, options);
  }
}

type DirectoryOptions = Partial<Node> & { unnamed?: boolean };

export class Directory extends Node {
  public get unnamed() {
    return !!this.name;
  }

  private readonly nodes = new Map<string, Node>();

  constructor(options: DirectoryOptions) {
    super();
    const { unnamed, ...finalOptions } = options;
    init(this, { mode: 0o755 }, finalOptions, !!unnamed);
  }

  add(node: Node) {
    this.nodes.set(node.name, node);
  }

  delete(node: Node) {
    this.nodes.delete(node.name);
  }

  list() {
    return Array.from(this.nodes.values());
  }

  clear() {
    this.nodes.clear();
  }

  get(name: string) {
    return this.nodes.get(name);
  }
}

function init<T extends Node, DefaultOptions, Options>(object: T, defaultOptions: DefaultOptions, options: Options, allowUnnamed = false) {
  Object.assign(object, defaultOptions, options);

  if (!allowUnnamed && !object.name) {
    throw new Error('name required');
  }
}

export function path(root: Directory, nodes: string[], nothrow = false) {
  let node: Node = root;

  for (const name of nodes) {
    if (!(node instanceof Directory)) {
      throw new Error('Wrong node type');
    }

    const child = node.get(name);

    if (!child) {
      if (nothrow) {
        return;
      }

      throw new Error(`'${name}' not found in '${node.name}'`);
    }

    node = child;
  }
  return node;
}

export function readText(root: Directory, nodes: string[]) {
  const file = path(root, nodes) as File;
  return file.content.toString();
}

export function writeText(root: Directory, nodes: string[], content: string) {
  const directory = path(root, nodes.slice(0, nodes.length - 1)) as Directory;
  const name = nodes[nodes.length - 1];

  let file = directory.get(name);
  if (!file) {
    file = new File({ name });
    directory.add(file);
  }

  if (!(file instanceof File)) {
    throw new Error('Wrong node type');
  }

  file.content = Buffer.from(content, 'ascii');
}

export function mkdirp(root: Directory, nodes: string[]) {
  let node = root;

  for (const name of nodes) {
    let child = node.get(name);
    if (!child) {
      child = new Directory({ name });
      node.add(child);
    }

    if (!(child instanceof Directory)) {
      throw new Error('Wrong node type');
    }

    node = child;
  }

  return node;
}
