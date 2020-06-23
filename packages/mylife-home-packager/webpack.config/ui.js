'use strict';

const path = require('path');

module.exports = (paths) => {
  return [(env, argv) => {
    const config = getClientConfig(env.mode);
    config.output.path = path.join(paths.output, 'static');
    return config;
  }, {
    entry: {
      'ui/bin': 'mylife-home-ui/dist/bin',
    }
  }];
};

function getClientConfig(mode) {
  switch(mode) {
    case 'dev':
      return require('mylife-home-ui/webpack.config.dev');
    case 'prod':
      return require('mylife-home-ui/webpack.config.prod');
    default:
      throw new Error(`Unsupported mode: '${mode}'`);
  }
}