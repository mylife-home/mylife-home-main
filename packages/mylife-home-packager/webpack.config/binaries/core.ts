import path from 'path';
import { DefinePlugin, DllPlugin, DllReferencePlugin } from 'webpack';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import WaitPlugin from '../plugins/wait-plugin';
import NoopPlugin from '../plugins/noop-plugin';
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
    }),
    new CopyWebpackPlugin({ 
      patterns: [{ 
        from: `${packagePath('mylife-home-core')}/dummy-dist-package.json`,
        to: path.join(context.outputPath, 'core/package.json')
      }]
    })
  ],
});

export const bin = (context: Context) => prepareServerConfiguration(context, {
  entry: {
    'core/bin': 'mylife-home-core/dist/bin',
  },
  plugins: [
    createWait(context),
    new DllReferencePlugin({
      context: context.basePath,
      manifest: libManifest(context),
      sourceType: 'commonjs2',
      name: './lib',
    }),
  ]
});

export const plugin = (context: Context, pluginName: string) => {
  const nativeModules = context.options.nativeModules as string[] || [];
  return prepareServerConfiguration(context, {
    entry: {
      [`core/plugins/${pluginName}`]: `mylife-home-core-plugins-${pluginName}`,
    },
    output: {
      libraryTarget: 'commonjs2'
    },
    plugins: [
      createWait(context),
      new DllReferencePlugin({
        context: context.basePath,
        manifest: libManifest(context),
        sourceType: 'commonjs2',
        name: '../lib',
      }),
      new DllPlugin({ 
        name: `Plugins${kebabCaseToUpperCamelCase(pluginName)}`,
        path: path.join(context.outputPath, `core/plugins/${pluginName}.js.manifest`)
      }),
      new DefinePlugin({
        __WEBPACK_PLUGIN_VERSION__: JSON.stringify(require(`mylife-home-core-plugins-${pluginName}/package.json`).version),
      }),
      nativeModules.length > 0 ? new CopyWebpackPlugin({
        patterns: nativeModules.map(nativeModule => ({
          from: `${pluginPath(pluginName)}/node_modules/${nativeModule}`, 
          to: path.join(context.outputPath, `core/build/${path.basename(nativeModule)}`)
        }))
      }) : null
    ].filter(plugin => plugin),
  })
};

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

function createWait(context: Context) {
  return context.options.wait ? new WaitPlugin(libManifest(context)) : new NoopPlugin();
}

function packagePath(packageName: string) {
  return path.dirname(require.resolve(`${packageName}/package.json`));
}

function pluginPath(pluginName: string) {
  return packagePath(`mylife-home-core-plugins-${pluginName}`);
}