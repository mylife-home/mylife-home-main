import { DefinePlugin, IgnorePlugin, Configuration } from 'webpack';
import { Context } from '../../context';

export default (context: Context) => ({
  output: {
    path: context.outputPath,
    filename: '[name].js',
  },
  module: {
    rules: [
      { test: /\.js$/, use: ['source-map-loader', 'shebang-loader'] }
    ],
  },
  target: 'node',
  node: {
    __dirname: false,
    __filename: false,
  },
  plugins: [
    new DefinePlugin({
      __WEBPACK_BUILD_INFO__: JSON.stringify(createBuildInfo()),
    }),
  ],
  stats: {
    warningsFilter: createWarningFilter('yargs', 'dtrace-provider', 'get-caller-file', 'ws', 'chokidar', 'express', 'engine.io', 'socket.io', 'ssh2')
  }
}) as Configuration;

interface ModuleInfo {
  readonly version: string;
}

function createBuildInfo() {
  const modules: { [name: string]: ModuleInfo; } = {};

  const { name, version, dependencies } = require('../../../package.json');
  modules[name] = { version };

  for (const dependency of Object.keys(dependencies)) {
    if (!dependency.startsWith('mylife-home')) {
      continue;
    }

    if (dependency.startsWith('mylife-home-core-plugins-')) {
      continue;
    }

    const { version } = require(`${dependency}/package.json`);
    modules[dependency] = { version };
  }

  return { timestamp: Date.now(), modules };
}

function createWarningFilter(...modules: string[]) {
  return (warning: any) => {
    const name: string = warning.moduleName;
    if(typeof name !== 'string') {
      return false;
    }

    for(const module of modules) {
      if(name.includes(`/node_modules/${module}/`)) {
        return true;
      }
    }

    return false;
  }
}
