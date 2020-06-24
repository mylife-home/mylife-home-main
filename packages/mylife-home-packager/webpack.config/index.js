'use strict';

const path = require('path');
const merge = require('webpack-merge');

const base = require('./base');
const modes = require('./modes');

const binaries = [
  require('./core'),
  require('./ui'),
];

module.exports = function (env, argv) {
  const paths = {
    base: path.resolve(__dirname, '..'),
    output: path.resolve(__dirname, '..', 'dist', env.mode)
  };

  const configurations = [];

  const createConfiguration = (binary) => {
    const mode = modes(paths)[env.mode];
    if (!mode) {
      throw new Error(`Unsupported mode: ${env.mode}`);
    }
  
    const ibase = base(paths);
  
    const config = typeof binary === 'function' ? binary(env, argv) : merge(ibase, mode, binary);
    configurations.push(config);
  };

  for (const binary of binaries) {
    const ibinary = binary(paths);
    if (Array.isArray(ibinary)) {
      ibinary.forEach(createConfiguration);
    } else {
      createConfiguration(ibinary);
    }
  }

  return configurations;
};
