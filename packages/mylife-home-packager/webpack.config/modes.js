'use strict';

const TerserPlugin = require('terser-webpack-plugin');

module.exports = (paths) => ({
  prod: {
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
    },
  },
  dev: {
    mode: 'development',
    devtool: 'inline-source-map',
  },
});
