'use strict';

const path = require('path');
const { DllPlugin, DllReferencePlugin } = require('webpack');
const WaitPlugin = require('./wait-plugin');

module.exports = (paths) => {
  const libManifest = path.join(paths.output, 'core/lib.js.manifest');
  
  return [{
    entry: {
      'core/lib': ['mylife-home-core', 'mylife-home-common', 'mylife-home-core/dist/bin'],
    },
    output: {
      libraryTarget: 'commonjs2'
    },
    plugins: [
      new DllPlugin({ 
        name: 'CoreLib',
        path: libManifest
      })
    ],
   }, {
    entry: {
      'core/bin': 'mylife-home-core/dist/bin',
    },
    plugins: [
      new WaitPlugin(libManifest),
      new DllReferencePlugin({
        context: paths.base,
        manifest: libManifest,
        sourceType: 'commonjs2',
        name: './lib',
      }),
    ]
  }, {
    entry: {
      'core/plugins/irc': 'mylife-home-core-plugins-irc',
    },
    output: {
      libraryTarget: 'commonjs2'
    },
    plugins: [
      new WaitPlugin(libManifest),
      new DllReferencePlugin({
        context: paths.base,
        manifest: libManifest,
        sourceType: 'commonjs2',
        name: '../lib',
      }),
      new DllPlugin({ 
        name: 'PluginsIrc',
        path: path.join(paths.output, 'core/plugins/irc.js.manifest')
      })
    ],
  }];
};