'use strict';

const path   = require('path');
//const common = require('mylife-home-common');
const Server = require('../lib/server');

const dev = process.argv.includes('--dev');

let configFile = path.join(__dirname, '../conf/config.json');
if(process.argv[dev ? 3 : 2]) { configFile = process.argv[2]; }
configFile = path.resolve(configFile);
const config = require(configFile);

//common.logging.init(config);
//common.admin.SysInfo.setup({ rootDirectory: path.resolve(__dirname, '..') });

const server = new Server(config, dev);

function terminate() {
  server.close(() => process.exit());
}

process.on('SIGINT', terminate);
process.on('SIGTERM', terminate);
