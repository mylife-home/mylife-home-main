import http from 'http';
import crypto from 'crypto';
import * as vfs from './vfs';
import * as archive from './archive';
import { BufferWriter, apipe } from './buffers';

type DictString = { [key: string]: string; };

// https://docs.alpinelinux.org/user-handbook/0.1a/Working/apk.html

const indexHeaders: DictString = {
  // https://wiki.alpinelinux.org/wiki/Apk_spec
  A: 'architecture', // Architecture
  C: 'csum', // Pull Checksum
  D: 'dependencies', // Pull Dependencies
  //I Package Installed Size
  //L License
  P: 'name', // Package Name
  S: 'size', // Package Size
  //T Package Description
  //U Package URL
  V: 'version', // Package Version
  //c Git commit of aport
  //i Automatic Install Condition (aka Install IF)
  //m Maintainer
  //o Package Origin
  p: 'provides', // Package Provides
  //t Build Timestamp (epoch)
};

export interface Package {
  repo: string;
  raw: string;
  name: string;
  version: string;
  architecture: string;
  csum: Buffer;
  dependencies: DictString;
  provides: DictString;
  size: number;
}

class Version {
  readonly major: number;
  readonly minor: number;
  readonly revision: number;
  readonly release: number;

  constructor(value: string) {
    const [version, release] = value.split('-r');
    const [major, minor, revision] = version.split('.');
    this.major = parseInt(major, 10);
    this.minor = parseInt(minor, 10);
    this.revision = parseInt(revision, 10);
    this.release = parseInt(release, 10);

    if (isNaN(this.major) || isNaN(this.release)) {
      throw new Error(`Invalid version: '${value}'`);
    }
  }

  toString() {
    let value = this.major.toString();
    if (!isNaN(this.minor)) {
      value += '.' + this.minor.toString();
    }
    if (!isNaN(this.revision)) {
      value += '.' + this.revision.toString();
    }

    return value + '-r' + this.release.toString();
  }

  equals(other: Version) {
    return this.major === other.major
      && this.minor === other.minor
      && this.revision === other.revision
      && this.release === other.release;
  }

  greater(other: Version) {
    if (this.major < other.major) {
      return false;
    } else if (this.major > other.major) {
      return true;
    }

    if (this.minor < other.minor) {
      return false;
    } else if (this.minor > other.minor) {
      return true;
    }

    if (this.revision < other.revision) {
      return false;
    } else if (this.revision > other.revision) {
      return true;
    }

    return this.release > other.release;
  }
}

export class Database {
  private readonly _list: Package[] = [];
  private readonly _provides = new Map<string, Package[]>();
  private readonly _names = new Map<string, Package[]>();
  private readonly _repositories = new Map<string, Buffer>();

  constructor(private readonly arch: string) { }

  getListByName(name: string) {
    return this._names.get(name);
  }

  getByName(name: string) {
    const list = this._names.get(name);
    return list && list[0];
  }

  getByProvide(provide: string) {
    return this._provides.get(provide);
  }

  list() {
    return this._list;
  }

  repositories() {
    return this._repositories;
  }

  async addLocalRepository(vfsRoot: vfs.Directory, path: string) {
    let indexPath = path;
    if (indexPath.endsWith('/')) {
      indexPath = indexPath.slice(0, -1);
    }
    const file = vfs.path(
      vfsRoot,
      (indexPath + `/${this.arch}/APKINDEX.tar.gz`).split('/').filter((n) => n)
    ) as vfs.File;

    await this.loadRepository(file.content, indexPath, path);
  }

  async addRepository(repo: string) {
    let url = repo;
    if (url.endsWith('/')) {
      url = url.slice(0, -1);
    }

    const buffer = await download(url + `/${this.arch}/APKINDEX.tar.gz`);
    await this.loadRepository(buffer, url, repo);
  }

  async loadRepository(buffer: Buffer, url: string, name: string) {
    if (this._repositories.get(name)) {
      throw new Error(`repository '${name}' already exists`);
    }
    this._repositories.set(name, buffer);

    const content = new vfs.Directory({ missing: true });

    await archive.extract(buffer, content);

    const raw = vfs.readText(content, ['APKINDEX']);
    const parts = raw.split('\n\n');

    for (const raw of parts) {
      const lines = raw.split('\n').filter((it) => it);
      if (!lines.length) {
        continue;
      }

      this._list.push(this.loadPackage(url, lines));
    }
  }

  private loadPackage(url: string, lines: string[]) {
    const output = {
      repo: url,
      raw: lines.join('\n') + '\n\n',
    } as Package;

    const items: DictString = {};

    for (const line of lines) {
      const prefix = line.substring(0, 1);
      const value = line.substring(2);
      const key = indexHeaders[prefix];
      if (!key) {
        continue;
      }
      items[key] = value;
    }

    for (const key of ['name', 'version', 'architecture'] as ('name' | 'version' | 'architecture')[]) {
      const val = items[key];
      if (!val) {
        throw new Error(`Missing field ${key} for package ${items.name}`);
      }
      output[key] = val;
    }

    const { csum, dependencies, provides, size } = items;

    if (!csum || !csum.startsWith('Q1')) {
      throw new Error(`Unrecognized checksum for package ${items.name}`);
    }
    output.csum = Buffer.from(csum.substring(2), 'base64');

    output.dependencies = {};
    for (const dep of (dependencies || '').split(' ')) {
      if (!dep) {
        continue;
      }

      let operator;
      let key;
      let version;

      if (dep.includes('<')) {
        operator = '<';
      } else if (dep.includes('>')) {
        operator = '>';
      }

      if (operator) {
        // FIXME
        // let's consider we are ok and use *
        key = dep.split(operator)[0];
        version = '*';
      } else {
        const split = dep.split('=');
        key = split[0];
        version = split[1] || '*';
      }

      output.dependencies[key] = version;
    }

    output.provides = {
      [output.name]: output.version,
    };

    for (const prov of (provides || '').split(' ')) {
      if (!prov) {
        continue;
      }
      const [key, version] = prov.split('=');
      output.provides[key] = version || '*';
    }

    output.size = parseInt(size);

    return output;
  }

  index() {
    for (const item of this._list) {
      addMapList(this._names, item.name, item);
      for (const prov of Object.keys(item.provides)) {
        addMapList(this._provides, prov, item);
      }
    }

    sortMapList(this._names, sortByVersionAndLocal);
    sortMapList(this._provides, sortByVersionAndLocal);
  }
}

export class InstallList {
  private readonly map = new Map<string, string>();
  private readonly _list: Package[] = [];

  constructor(private readonly database: Database) { }

  list() {
    return this._list;
  }

  async download(vfsCacheDirectory: vfs.Directory) {
    for (const pack of this._list) {
      if (isLocal(pack)) {
        continue;
      }

      const url = `${pack.repo}/${pack.architecture}/${pack.name}-${pack.version}.apk`;
      const content = await download(url);
      if (content.length !== pack.size) {
        throw new Error(`Invalid package : ${url}`);
      }
      const csum = pack.csum.toString('hex').substring(0, 8);
      const name = `${pack.name}-${pack.version}.${csum}.apk`;

      vfsCacheDirectory.add(new vfs.File({ name, content }));
    }
  }

  async dumpIndexes(vfsCacheDirectory: vfs.Directory) {
    for (const [repo, content] of this.database.repositories()) {
      if (repo.startsWith('/')) {
        continue;
      }

      vfsCacheDirectory.add(new vfs.File({ name: `APKINDEX.${sha1(repo).substring(0, 8)}.tar.gz`, content }));
    }
  }

  addPackage(name: string) {
    if (this.map.get(name)) {
      return;
    }

    const item = this.database.getByName(name);
    if (!item) {
      throw new Error(`Package not found : ${name}`);
    }

    this._addItem(item);
    this._listDependencies(item);
  }

  _addItem(item: Package) {
    this._list.push(item);
    this.map.set(item.name, item.version);
  }

  _listDependencies(item: Package) {
    for (const name of Object.keys(item.dependencies)) {
      const version = item.dependencies[name];
      const dep = this._findDependency(name, version);
      if (this._addDependency(dep)) {
        this._listDependencies(dep);
      }
    }
  }

  _findDependency(name: string, version: string) {
    const list = this.database.getByProvide(name);
    if (!list) {
      throw new Error(`Dependency not found : ${name}`);
    }

    if (version === '*') {
      // return higher version
      return list[0];
    }

    const item = list.find((it) => it.version === version);
    if (!item) {
      throw new Error(`Dependency not found : ${name}-${version} (available are : ${list.map((it) => it.name + '-' + it.version)}`);
    }

    return item;
  }

  _addDependency(dep: Package) {
    const existing = this.map.get(dep.name);
    if (!existing) {
      this._addItem(dep);
      return true;
    }

    if (existing === dep.version) {
      return false;
    }

    throw new Error(`version mismatch for dependency ${dep.name} : ${dep.version} vs ${existing}`);
  }
}

function addMapList<K, V>(map: Map<K, V[]>, key: K, value: V) {
  let list = map.get(key);
  if (!list) {
    map.set(key, (list = []));
  }
  list.push(value);
}

function sortMapList<K, V>(map: Map<K, V[]>, sorter: (a: V, b: V) => number) {
  for (const list of map.values()) {
    list.sort(sorter);
  }
}

function sortByVersionAndLocal(p1: Package, p2: Package) {
  // best higher possible version
  // best local package
  const v1 = new Version(p1.version);
  const v2 = new Version(p2.version);

  if (v2.greater(v1)) {
    return 1;
  }
  if (v1.greater(v2)) {
    return -1;
  }

  const p1local = isLocal(p1);
  const p2local = isLocal(p2);

  if (p1local === p2local) {
    return 0;
  }
  return p1local ? -1 : 1;
}

function isLocal(pack: Package) {
  return pack.repo.startsWith('/');
}

async function download(url: string) {
  const response = await new Promise<http.IncomingMessage>((resolve, reject) => {
    const req = http.get(url, resolve);
    req.once('error', reject);
  });

  if (response.statusCode !== 200) {
    throw new Error(`Got HTTP status code ${response.statusCode} (${response.statusMessage})`);
  }

  const writer = new BufferWriter();
  await apipe(response, writer);
  return writer.getBuffer();
}

function sha1(input: string) {
  return crypto.createHash('sha1').update(input).digest('hex');
}
