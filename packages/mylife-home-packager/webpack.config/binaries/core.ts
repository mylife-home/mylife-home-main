import path from 'path';
import { DllPlugin, DllReferencePlugin } from 'webpack';
import WaitPlugin from '../plugins/wait-plugin';
import { Context } from '../context';
import { prepareServerConfiguration } from './common/tools';

export const lib = (context: Context) => prepareServerConfiguration(context, {
  entry: {
    'core/lib': ['mylife-home-core', 'mylife-home-common', 'mylife-home-core/dist/bin'],
  },
  output: {
    libraryTarget: 'commonjs2'
  },
  plugins: [
    new DllPlugin({ 
      name: 'CoreLib',
      path: libManifest(context)
    })
  ],
});

export const bin = (context: Context) => prepareServerConfiguration(context, {
  entry: {
    'core/bin': 'mylife-home-core/dist/bin',
  },
  plugins: [
    context.options.wait && new WaitPlugin(libManifest(context)),
    new DllReferencePlugin({
      context: context.basePath,
      manifest: libManifest(context),
      sourceType: 'commonjs2',
      name: './lib',
    }),
  ]
});

export const plugin = (context: Context, pluginName: string) =>  prepareServerConfiguration(context, {
  entry: {
    [`core/plugins/${pluginName}`]: `mylife-home-core-plugins-${pluginName}`,
  },
  output: {
    libraryTarget: 'commonjs2'
  },
  plugins: [
    context.options.wait && new WaitPlugin(libManifest(context)),
    new DllReferencePlugin({
      context: context.basePath,
      manifest: libManifest(context),
      sourceType: 'commonjs2',
      name: '../lib',
    }),
    new DllPlugin({ 
      name: `Plugins${kebabCaseToUpperCamelCase(pluginName)}`,
      path: path.join(context.outputPath, `core/plugins/${pluginName}.js.manifest`)
    })
  ],
});

export function listPlugins() {
  const prefix = 'mylife-home-core-plugins-';
  const { dependencies } = require('../../package.json');

  return Object.keys(dependencies)
    .filter(dependency => dependency.startsWith(prefix))
    .map(dependency => dependency.substring(prefix.length));
}

function libManifest(context: Context) {
  return path.join(context.outputPath, 'core/lib.js.manifest');
}


function kebabCaseToUpperCamelCase(str: string) {
  return str
    .split('-')
    .map(item => item.charAt(0).toUpperCase() + item.slice(1))
    .join('');
}
