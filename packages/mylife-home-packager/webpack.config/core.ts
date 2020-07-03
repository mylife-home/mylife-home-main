import path from 'path';
import { DllPlugin, DllReferencePlugin, Configuration } from 'webpack';
import WaitPlugin from './wait-plugin';
import { Context } from './context';
import { prepareServerConfiguration } from './tools';

export default (context: Context) => {
  const libManifest = path.join(context.outputPath, 'core/lib.js.manifest');
  
  return [prepareServerConfiguration(context, {
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
   }), prepareServerConfiguration(context, {
    entry: {
      'core/bin': 'mylife-home-core/dist/bin',
    },
    plugins: [
      new WaitPlugin(libManifest),
      new DllReferencePlugin({
        context: context.basePath,
        manifest: libManifest,
        sourceType: 'commonjs2',
        name: './lib',
      }),
    ]
  }), ...listPlugins().map(pluginName => prepareServerConfiguration(context, {
    entry: {
      [`core/plugins/${pluginName}`]: `mylife-home-core-plugins-${pluginName}`,
    },
    output: {
      libraryTarget: 'commonjs2'
    },
    plugins: [
      new WaitPlugin(libManifest),
      new DllReferencePlugin({
        context: context.basePath,
        manifest: libManifest,
        sourceType: 'commonjs2',
        name: '../lib',
      }),
      new DllPlugin({ 
        name: `Plugins${kebabCaseToUpperCamelCase(pluginName)}`,
        path: path.join(context.outputPath, `core/plugins/${pluginName}.js.manifest`)
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

function kebabCaseToUpperCamelCase(str: string) {
  return str
    .split('-')
    .map(item => item.charAt(0).toUpperCase() + item.slice(1))
    .join('');
}
