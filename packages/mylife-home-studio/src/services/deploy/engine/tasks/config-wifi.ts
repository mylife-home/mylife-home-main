'use strict';

const vfs   = require('../vfs');
const utils = require('../tasks-utils');

exports.metadata = {
  description : 'configure a wifi interface (wpa_supplicant package and daemon required)',
  parameters  : [
    { name : 'iface', description: 'network interface name (eg: wlan0)',                          type: 'string' },
    { name : 'ssid',  description: 'wifi ssid',                                                   type: 'string' },
    { name : 'psk',   description: 'psk as in command output : wpa_passphrase MYSSID passphrase', type: 'string' }
  ]
};

exports.execute = async (context, parameters) => {
  const { iface, ssid, psk } = parameters;
  const log = utils.createLogger(context, 'config:wifi');
  log.info(`configure ssid '${ssid}' and psk '${psk}' for interface '${iface}'`);

  log.debug('config: update /etc/networkinterfaces');
  const interfaces = vfs.readText(context.config, [ 'etc', 'network', 'interfaces' ]).split('\n');
  const hostrow    = interfaces.find(row => row.trim().startsWith('hostname'));
  if(!interfaces[interfaces.length - 1].trim()) {
    interfaces.splice(interfaces.length - 1, 1);
  }
  interfaces.push(`auto ${iface}`);
  interfaces.push(`iface ${iface} inet dhcp`);
  hostrow && interfaces.push(hostrow);
  interfaces.push('');
  vfs.writeText(context.config, [ 'etc', 'network', 'interfaces' ], interfaces.join('\n'));

  log.debug('config: create /etc/wpa_supplicant/wpa_supplicant.conf');

  const wpa = [
    'network={',
    `  ssid="${ssid}"`,
    `  psk=${psk}`,
    '}',
    '',
  ];

  vfs.mkdirp(context.config, [ 'etc', 'wpa_supplicant' ]);
  vfs.writeText(context.config, [ 'etc', 'wpa_supplicant', 'wpa_supplicant.conf' ], wpa.join('\n'));
};
