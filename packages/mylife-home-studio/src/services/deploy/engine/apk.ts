import http from 'http';
import crypto from 'crypto';
const vfs     = require('./vfs');
const archive = require('./archive');
const { BufferWriter, apipe } = require('./buffers');

const arch = 'armhf';

const indexHeaders = {
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

function valideProvideDependency(key) {
  const [ prefix, name ] = key.split(':');
  if(!name) { return true; } // no prefix
  return ['so', 'pc'].includes(prefix);
}

function addMapList(map, key, value) {
  let list = map.get(key);
  if(!list) {
    map.set(key, (list = []));
  }
  list.push(value);
}

function sortMapList(map, sorter) {
  for(const list of map.values()) {
    list.sort(sorter);
  }
}

function sortByVersionAndLocal(p1, p2) {
  // best higher possible version
  // best local package

  if(p1.version < p2.version) { return 1; }
  if(p1.version > p2.version) { return -1; }

  const p1local = isLocal(p1);
  const p2local = isLocal(p2);

  if(p1local === p2local) { return 0; }
  return p1local ? -1 : 1;
}

function isLocal(pack) {
  return pack.repo.startsWith('/');
}

async function download(url) {
  const stream = await new Promise((resolve, reject) => {
    const req = http.get(url, resolve);
    req.once('error', reject);
  });

  const writer = new BufferWriter();
  await apipe(stream, writer);
  return writer.getBuffer();
}

class Database {
  constructor() {
    this._list         = [];
    this._provides     = new Map();
    this._names        = new Map();
    this._repositories = new Map();
  }

  getListByName(name) {
    return this._names.get(name);
  }

  getByName(name) {
    const list = this._names.get(name);
    return list && list[0];
  }

  getByProvide(provide) {
    return this._provides.get(provide);
  }

  list() {
    return this._list;
  }

  repositories() {
    return this._repositories;
  }

  async addLocalRepository(vfsRoot, path) {
    let indexPath = path;
    if(indexPath.endsWith('/')) {
      indexPath = indexPath.slice(0, -1);
    }
    const file = vfs.path(vfsRoot, (indexPath + `/${arch}/APKINDEX.tar.gz`).split('/').filter(n => n));

    await this.loadRepository(file.content, indexPath, path);
  }

  async addRepository(repo) {
    let url = repo;
    if(url.endsWith('/')) {
      url = url.slice(0, -1);
    }

    const buffer = await download(url + `/${arch}/APKINDEX.tar.gz`);
    await this.loadRepository(buffer, url, repo);
  }

  async loadRepository(buffer, url, name) {
    if(this._repositories.get(name)) {
      throw new Error(`repository '${name}' already exists`);
    }
    this._repositories.set(name, buffer);

    const content = new vfs.Directory();
    await archive.extract(buffer, content);

    const raw   = vfs.readText(content, [ 'APKINDEX' ]);
    const parts = raw.split('\n\n');

    for(const raw of parts) {
      const lines = raw.split('\n').filter(it => it);
      if(!lines.length) {
        continue;
      }

      const output = {
        repo : url,
        raw  : lines.join('\n') + '\n\n'
      };

      const items = {};

      for(const line of lines) {
        const prefix = line.substring(0, 1);
        const value  = line.substring(2);
        const key    = indexHeaders[prefix];
        if(!key) {
          continue;
        }
        items[key] = value;
      }

      [ 'name', 'version', 'architecture' ].forEach(key => {
        const val = items[key];
        if(!val) {
          throw new Error(`Missing field ${key} for package ${items.name}`);
        }
        output[key] = val;
      });

      const { csum, dependencies, provides, size } = items;

      if(!csum || !csum.startsWith('Q1')) {
        throw new Error(`Unrecognized checksum for package ${items.name}`);
      }
      output.csum = Buffer.from(csum.substring(2), 'base64');

      output.dependencies = {};
      for(const dep of (dependencies || '').split(' ')) {
        if(!dep) { continue; }

        if(dep.startsWith('!')) {
          // FIXME
          // ignore it for now
          continue;
        }

        let operator;
        let key;
        let version;

        if(dep.includes('<')) {
          operator = '<';
        } else if(dep.includes('>')) {
          operator = '>';
        }

        if(operator) {
          // FIXME
          // let's consider we are ok and use *
          key = dep.split(operator)[0];
          version = '*';
        } else {
          const split = dep.split('=');
          key = split[0];
          version = split[1] || '*';
        }

        if(!valideProvideDependency(key)) {
          throw new Error(`Unsupported dependency : ${key} for package ${items.name}`);
        }
        output.dependencies[key] = version;
      }

      output.provides = {
        [output.name] : output.version
      };

      for(const prov of (provides || '').split(' ')) {
        if(!prov) { continue; }
        const [ key, version ] = prov.split('=');
        if(!valideProvideDependency(key)) {
          continue;
        }
        output.provides[key] = version || '*';
      }

      output.size = parseInt(size);

      this._list.push(output);
    }
  }

  index() {
    for(const item of this._list) {
      addMapList(this._names, item.name, item);
      for(const prov of Object.keys(item.provides)) {
        addMapList(this._provides, prov, item);
      }
    }

    sortMapList(this._names, sortByVersionAndLocal);
    sortMapList(this._provides, sortByVersionAndLocal);
  }
}

class InstallList {
  constructor(database) {
    this._database = database;
    this._list = [];
    this._map = new Map();
  }

  list() {
    return this._list;
  }

  async download(vfsCacheDirectory) {
    for(const pack of this._list) {
      if(isLocal(pack)) {
        continue;
      }

      const url = `${pack.repo}/${pack.architecture}/${pack.name}-${pack.version}.apk`;
      const content = await download(url);
      if(content.length !== pack.size) {
        throw new Error(`Invalid package : ${url}`);
      }
      const csum = pack.csum.toString('hex').substring(0, 8);
      const name = `${pack.name}-${pack.version}.${csum}.apk`;

      vfsCacheDirectory.add(new vfs.File({ name, content }));
    }
  }

  async dumpIndexes(vfsCacheDirectory) {
    for(const [repo, content] of this._database.repositories()) {
      if(repo.startsWith('/')) {
        continue;
      }

      vfsCacheDirectory.add(new vfs.File({ name: `APKINDEX.${sha1(repo).substring(0, 8)}.tar.gz`, content}));
    }
  }

  addPackage(name) {
    if(this._map.get(name)) {
      return;
    }

    const item = this._database.getByName(name);
    if(!item) {
      throw new Error(`Package not found : ${name}`);
    }

    this._addItem(item);
    this._listDependencies(item);
  }

  _addItem(item) {
    this._list.push(item);
    this._map.set(item.name, item.version);
  }

  _listDependencies(item) {
    for(const name of Object.keys(item.dependencies)) {
      const version = item.dependencies[name];
      const dep = this._findDependency(name, version);
      if(this._addDependency(dep)) {
        this._listDependencies(dep);
      }
    }
  }

  _findDependency(name, version) {
    const list = this._database.getByProvide(name);
    if(!list) {
      throw new Error(`Dependency not found : ${name}`);
    }

    if(version === '*') {
      return list[0];
    }

    const item = list.find(it => it.version === version);
    if(!item) {
      throw new Error(`Dependency not found : ${name}-${version} (available are : ${list.map(it => it.name + '-' + it.version)}`);
    }

    return item;
  }

  _addDependency(dep) {
    const existing = this._map.get(dep.name);
    if(!existing) {
      this._addItem(dep);
      return true;
    }

    if(existing === dep.version) {
      return false;
    }

    throw new Error(`version mismatch for dependency ${dep.name} : ${dep.version} vs ${existing}`);
  }
}

function sha1(input: string ){
  return crypto.createHash('sha1').update(input).digest('hex');
}

exports.Database    = Database;
exports.InstallList = InstallList;
