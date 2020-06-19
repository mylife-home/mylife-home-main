import path from 'path';
import Server from '../lib/server';

const dev = process.argv.includes('--dev');

let configFile = path.join(__dirname, '../conf/config.json');
if (process.argv[dev ? 3 : 2]) {
  configFile = process.argv[2];
}
configFile = path.resolve(configFile);
const config = require(configFile);

const server = new Server(config, dev);

function terminate() {
  server.close(() => process.exit());
}

process.on('SIGINT', terminate);
process.on('SIGTERM', terminate);
