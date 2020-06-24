'use strict';

const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

module.exports = class CustomizedBundleAnalyzerPlugin extends BundleAnalyzerPlugin {
  apply(compiler) {
    this.opts.reportFilename = Object.keys(compiler.options.entry)[0] + '.report.html';
    return super.apply(compiler);
  }
};
