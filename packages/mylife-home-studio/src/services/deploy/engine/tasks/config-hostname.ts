'use strict';

const vfs   = require('../vfs');
const utils = require('../tasks-utils');

exports.metadata = {
  description : 'set the hostname',
  parameters  : [
    { name : 'hostname', description: 'host name', type: 'string' }
  ]
};

function replaceHost(log, context, path, oldHost, newHost) {
  log.debug(`config: replace ${oldHost} to ${newHost} in file '/${path.join('/')}'`);
  let content = vfs.readText(context.config, path);
  content = content.replace(new RegExp(oldHost, 'g'), newHost);
  vfs.writeText(context.config, path, content);
}

exports.execute = async (context, parameters) => {
  const { hostname } = parameters;
  const log = utils.createLogger(context, 'config:hostname');
  log.info(`set hostname to '${hostname}'`);
  let oldHostname  = vfs.readText(context.config, [ 'etc', 'hostname' ]);
  oldHostname = oldHostname.trimRight();
  log.debug(`existing hostname found : '${oldHostname}'`);

  replaceHost(log, context, [ 'etc', 'hostname' ], oldHostname, hostname);
  replaceHost(log, context, [ 'etc', 'network', 'interfaces' ], oldHostname, hostname);
  replaceHost(log, context, [ 'etc', 'hosts' ], oldHostname, hostname);

  const configFile = context.root.list().find(node => node.name.endsWith('.apkovl.tar.gz'));
  log.debug(`rename image file '${configFile.name}' to '${hostname}.apkovl.tar.gz'`);
  context.root.delete(configFile);
  configFile.name = hostname + '.apkovl.tar.gz';
  context.root.add(configFile);
};