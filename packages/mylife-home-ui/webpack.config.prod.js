const base = require('./webpack.config.common');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  ...base,
  mode: 'production',
  devtool: 'nosources-source-map',
  optimization: {
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          keep_classnames: true,
          keep_fnames: true,
        },
      }),
    ],
  }
};
