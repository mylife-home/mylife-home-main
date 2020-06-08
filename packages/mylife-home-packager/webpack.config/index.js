'use strict';

const merge = require('webpack-merge');

const base = require('./base');

const modes = {
  dev: require('./dev'),
  prod: require('./prod'),
};

const binaries = [
  require('./core')
];

module.exports = function (env, argv) {
  const mode = modes[env.mode];
  if (!mode) {
    throw new Error(`Unsupported mode: ${env.mode}`);
  }

  return binaries.map(binary => merge(base, mode, binary));
};
