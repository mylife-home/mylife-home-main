const FilterWarningsPlugin = require('webpack-filter-warnings-plugin');

module.exports = {
  entry: {
    'core/bin': 'mylife-home-core',
    'core/plugins/irc': 'mylife-home-core-plugins-irc'
  },
  module: {
    rules: [
      { test: /\.js$/, use: ['source-map-loader', 'shebang-loader'] }
    ]
  },
  output: {
    filename: '[name].js'
  },
  target: 'node',
  plugins: [
    new FilterWarningsPlugin({
      exclude: [
        /Module not found\: Error\: Can't resolve 'bufferutil' in '\/Users\/vincent\/workspace\/private\/sandbox\/home\-mqtt\/node_modules\/ws\/lib'/,
        /Module not found\: Error\: Can't resolve 'utf-8-validate' in '\/Users\/vincent\/workspace\/private\/sandbox\/home\-mqtt\/node_modules\/ws\/lib'/
      ]
    })
  ]
};
