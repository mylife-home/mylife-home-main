const { DefinePlugin, IgnorePlugin } = require('webpack');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
  entry: {
    'core/bin': 'mylife-home-core/dist/bin',
    'core/plugins/irc': { import: 'mylife-home-core-plugins-irc', dependOn: 'core/bin' },
  },
  module: {
    rules: [{ test: /\.js$/, use: ['source-map-loader', 'shebang-loader'] }],
  },
  output: {
    filename: '[name].js',
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

    new CleanWebpackPlugin(),

    ignore(/^utf-8-validate$/, /mylife-home-common\/node_modules\/ws\/lib$/),
    ignore(/^bufferutil$/, /mylife-home-common\/node_modules\/ws\/lib$/),
    ignore(/^.\/src\/build$/, /mylife-home-common\/node_modules\/dtrace-provider$/),

    // irc optional encoding
    ignore(/^node-icu-charset-detector$/, /mylife-home-core-plugins-irc\/node_modules\/irc\/lib$/),
    ignore(/^iconv$/, /mylife-home-core-plugins-irc\/node_modules\/irc\/lib$/),
  ],
};

function createBuildInfo() {
  const modules = {};

  const { name, version, dependencies } = require('./package.json');
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

function ignore(resourceRegExp, contextRegExp) {
  return new IgnorePlugin({ resourceRegExp, contextRegExp });
}
