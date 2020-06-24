'use strict';

const TerserPlugin = require('terser-webpack-plugin');
const CustomizedBundleAnalyzerPlugin = require('./customized-bundle-analyzer-plugin');

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
    plugins: [new CustomizedBundleAnalyzerPlugin({ analyzerMode: 'static' })],
  },
  dev: {
    mode: 'development',
    devtool: 'inline-source-map',
  },
});
