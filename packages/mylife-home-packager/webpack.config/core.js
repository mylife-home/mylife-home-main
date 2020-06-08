'use strict';

const path = require('path');
const { DllPlugin, DllReferencePlugin } = require('webpack');
const WaitPlugin = require('./wait-plugin');

module.exports = (paths) => {
  const libManifest = path.join(paths.output, 'core/lib.js.manifest');
  
  return [{
    entry: {
      'core/lib': ['mylife-home-core', 'mylife-home-common'],
    },
    plugins: [
      new DllPlugin({ 
        path: libManifest
      })
    ]
  }, {
    entry: {
      'core/bin': 'mylife-home-core/dist/bin',
    },
    plugins: [
      new WaitPlugin(libManifest),
      new DllReferencePlugin({
        context: paths.base,
        manifest: libManifest
      }),
    ]
  }, {
    entry: {
      'core/plugins/irc': 'mylife-home-core-plugins-irc',
    },
    plugins: [
      new WaitPlugin(libManifest),
      new DllReferencePlugin({
        context: paths.base,
        manifest: libManifest
      }),
      new DllPlugin({ 
        path: path.join(paths.output, 'core/plugins/irc.js.manifest')
      })
    ],
  }];
};