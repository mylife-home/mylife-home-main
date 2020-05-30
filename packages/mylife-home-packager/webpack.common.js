const FilterWarningsPlugin = require('webpack-filter-warnings-plugin');
const { DefinePlugin } = require('webpack');

module.exports = {
  entry: {
    'core/bin': 'mylife-home-core',
    'core/plugins/irc': 'mylife-home-core-plugins-irc',
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
    __filename: false
  },
  plugins: [
    new DefinePlugin({
      __WEBPACK_BUILD_INFO__: JSON.stringify(createBuildInfo()),
    }),
    new FilterWarningsPlugin({
      exclude: [
        /Module not found\: Error\: Can't resolve 'bufferutil' in '\/Users\/vincent\/workspace\/private\/sandbox\/home\-mqtt\/node_modules\/ws\/lib'/,
        /Module not found\: Error\: Can't resolve 'utf-8-validate' in '\/Users\/vincent\/workspace\/private\/sandbox\/home\-mqtt\/node_modules\/ws\/lib'/,
      ],
    }),
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
