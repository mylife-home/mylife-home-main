const base = require('./webpack.config.common');

module.exports = {
  ...base,
  mode: 'development',
  devtool: 'inline-source-map',
};
