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
  }, ...listPlugins().map(pluginName => ({
    entry: {
      [`core/plugins/${pluginName}`]: `mylife-home-core-plugins-${pluginName}`,
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
        name: `Plugins${kebabCaseToUpperCamelCase(pluginName)}`,
        path: path.join(paths.output, `core/plugins/${pluginName}.js.manifest`)
      })
    ],
  }))];
};

function listPlugins() {
  const prefix = 'mylife-home-core-plugins-';
  const { dependencies } = require('../package.json');

  return Object.keys(dependencies)
    .filter(dependency => dependency.startsWith(prefix))
    .map(dependency => dependency.substring(prefix.length));
}

function kebabCaseToUpperCamelCase(str) {
  return str
    .split('-')
    .map(item => item.charAt(0).toUpperCase() + item.slice(1))
    .join('');
}
