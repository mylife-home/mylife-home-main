'use strict';

const merge = require('webpack-merge');

const base = require('./base');

const modes = {
  dev: require('./dev'),
  prod: require('./prod'),
};

const binaries = [
  require('./core'),
];

module.exports = function (env, argv) {
  const mode = modes[env.mode];
  if (!mode) {
    throw new Error(`Unsupported mode: ${env.mode}`);
  }

  const configurations = [];

  const createConfiguration = (binary) => {
    configurations.push(merge(base, mode, binary));
  };

  for (const binary of binaries) {
    if (Array.isArray(binary)) {
      binary.forEach(createConfiguration);
    } else {
      createConfiguration(binary);
    }
  }

  return binaries.map((binary) => merge(base, mode, binary));
};
