'use strict';

module.exports = [{
  entry: {
    'core/bin': 'mylife-home-core/dist/bin',
  },
  output: {
    filename: '[name].js',
  },
}, {
  entry: {
    'core/plugins/irc': 'mylife-home-core-plugins-irc',
  },
  output: {
    filename: '[name].js',
  },
}];
