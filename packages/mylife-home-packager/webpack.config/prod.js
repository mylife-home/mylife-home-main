'use strict';

const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  mode: 'production',
  output: {
    path: path.resolve(__dirname, '..', 'dist', 'prod'),
  },
  devtool: 'nosources-source-map',
  optimization: {
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          keep_classnames: true,
          keep_fnames: true,
        }
      }),
    ],
  },
};
