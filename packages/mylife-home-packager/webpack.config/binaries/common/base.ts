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

    ignore(/^utf-8-validate$/, /mylife-home-common\/node_modules\/ws\/lib$/),
    ignore(/^bufferutil$/, /mylife-home-common\/node_modules\/ws\/lib$/),
    ignore(/^.\/src\/build$/, /mylife-home-common\/node_modules\/dtrace-provider$/),

    // irc optional encoding
    ignore(/^node-icu-charset-detector$/, /node_modules\/irc\/lib$/),
    ignore(/^iconv$/, /node_modules\/irc\/lib$/),
  ],
  stats: {
    // https://github.com/yargs/yargs/blob/HEAD/docs/webpack.md#webpack-configuration
    // Ignore warnings due to yarg's dynamic module loading
    warningsFilter: [
      /mylife-home-common\/node_modules\/yargs/,
      /mylife-home-common\/node_modules\/get-caller-file/,
      /mylife-home-common\/node_modules\/require-main-filename/,
    ],
  },
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

    const { version } = require(`${dependency}/package.json`);
    modules[dependency] = { version };
  }

  return { timestamp: Date.now(), modules };
}

function ignore(resourceRegExp: RegExp, contextRegExp: RegExp) {
  return new IgnorePlugin({ resourceRegExp, contextRegExp });
}
