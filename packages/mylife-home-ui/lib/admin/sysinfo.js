'use strict';

const util        = require('util');
const os          = require('os');
const humanFormat = require('human-format');
const rpt         = require('read-package-tree');
const semver      = require('semver');
const log4js      = require('log4js');
const logger      = log4js.getLogger('admin.SysInfo');

let rootDirectory;
let packages;

function padRight(char, length, str) {
  return str + char.repeat(Math.max(0, length - str.length));
}

const timeScale = new humanFormat.Scale({
  seconds : 1,
  minutes : 60,
  hours   : 3600,
  days    : 86400,
  months  : 2592000,
});

const timeFormat = t => humanFormat(t, { scale: timeScale });

function getCpus() {
  const map = new Map();
  for(const cpu of os.cpus()) {
    const key = JSON.stringify([ cpu.model, cpu.speed ]);
    let value = map.get(key);
    value || map.set(key, (value = { model : cpu.model, speed: cpu.speed, count: 0 }));
    ++value.count;
  }
  return Array.from(map.values());
}

function processNode(packages, node) {
  if(packages.get(node.id)) { return; }

  const info = {
    name    : node.package.name,
    version : node.package.version
  };

  if(node.id === 0) {
    info.main = true;
  }

  packages.set(node.id, info);

  for(const dep of Object.keys(node.package.dependencies || {})) {
    const version = node.package.dependencies[dep];
    const child   = findDependency(node, dep, version);

    if(!child) {
      logger.error(`Package not found: ${dep}@${version}`)
      continue;
    }

    processNode(packages, child);
  }
}

function findDependency(node, name, version) {

  const match = n => {
    if(n.package.name !== name) { return false; }
    if(!semver.valid(version)) { return true; } // github:user/package for example
    return semver.satisfies(n.package.version, version);
  }

  // look in node's children, going through parent
  while(node) {
    if(match(node)) { return node; }

    for(const child of node.children) {
      if(match(child)) { return child; }
    }

    node = node.parent;
  }
}

function getPackages(done) {
  if(!rootDirectory) {
    return done(new Error('rootDirectory not set'));
  }

  if(packages) {
    return done(null, packages);
  }

  rpt(rootDirectory, () => true, (err, data) => { // TODO: path
    if(err) { return done(err); }

      const map = new Map();
      processNode(map, data);

      packages = Array.from(map.values());
      return done(null, packages);
  });
}

// --- API ---

function getInfo(done) {
  getPackages((err, packages) => {
    if(err) { return done(err); }

    return done(null, {
      'os.arch'              : os.arch(),
      'os.cpus'              : getCpus(),
      'os.freemem'           : os.freemem(),
      'os.loadavg'           : os.loadavg(),
      'os.platform'          : os.platform(),
      'os.release'           : os.release(),
      'os.totalmem'          : os.totalmem(),
      'os.type'              : os.type(),
      'os.uptime'            : os.uptime(),
      'process.version'      : process.version,
      'process.cpuUsage'     : process.cpuUsage ? process.cpuUsage() : { system: 0, user: 0 },
      'process.uptime'       : process.uptime(),
      'mylife.rootDirectory' : rootDirectory,
      'mylife.packages'      : packages
    });
  });
}

function setup(config) {
  rootDirectory = config.rootDirectory;
}

const definition = Object.freeze({
  desc: 'System',
  children: {
    info: {
      desc: 'Get system information',
      impl: (w) => getInfo((err, data) => {
        if(err) { return w('Error: ' + err.message); }

        const keyLength = Object.keys(data).reduce((acc, cur) => Math.max(cur.length, acc), 0);
        const pad = padRight.bind(null, ' ', keyLength);

        for(const key of Object.keys(data)) {
          switch(key) {
            case 'mylife.packages': {
              const packages = data[key];
              const main = packages.find(p => p.main);
              w(`${pad(key)} : ${main && main.name}@${main && main.version} (${packages.length - 1} dependencies)`);
              break;
            }

            case 'os.freemem':
            case 'os.totalmem':
              w(`${pad(key)} : ${humanFormat(data[key], { scale: 'binary', unit: 'B' })}`);
              break;

            case 'os.uptime':
            case 'process.uptime':
              w(`${pad(key)} : ${timeFormat(data[key])}`);
              break;

            case 'process.cpuUsage':
              w(`${pad(key)} : user: ${timeFormat(data[key].user / 1E6)}, system: ${timeFormat(data[key].system / 1E6)}`);
              break;

            case 'os.arch':
            case 'os.platform':
            case 'os.release':
            case 'os.type':
            case 'process.version':
            case 'mylife.rootDirectory':
              w(`${pad(key)} : ${data[key]}`);
              break;

            default:
              w(`${pad(key)} : ${util.inspect(data[key], { breakLength: Infinity })}`);
              break;
          }
        }
      })
    },
    packages: {
      desc: 'Get packages information',
      impl: (w) => getInfo((err, data) => {
        if(err) { return w('Error: ' + err.message); }

        const pad = padRight.bind(null, ' ', 50);
        let row = '';
        let acc = 0;

        const packages = data['mylife.packages'];
        packages.sort((a, b) => {
          if(a.name < b.name) { return -1; }
          if(a.name > b.name) { return 1; }
          if(a.version < b.version) { return -1; }
          if(a.version > b.version) { return 1; }
          return 0;
        });

        for(const pack of packages) {
          row += pad(`${pack.name}${pack.main ? ' (main)' : ''}@${pack.version}`);
          ++acc;

          if(acc < 4) { continue; }

          w(row);
          row = '';
          acc = 0;
        }

        if(acc > 0) { w(row); }
      })
    }
  }
});

module.exports.getInfo    = getInfo;
module.exports.definition = definition;
module.exports.setup      = setup;
