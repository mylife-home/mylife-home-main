'use strict';

const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

module.exports = class CustomizedBundleAnalyzerPlugin extends BundleAnalyzerPlugin {
  apply(compiler) {
    const name = Object.keys(compiler.options.entry)[0];
    this.opts.reportFilename = `${name}.report.html`;
    this.opts.reportTitle = `${name} [${currentTime()}]`;
    
    return super.apply(compiler);
  }
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function currentTime() {
  const time = new Date();
  const year = time.getFullYear();
  const month = MONTHS[time.getMonth()];
  const day = time.getDate();
  const hour = `0${time.getHours()}`.slice(-2);
  const minute = `0${time.getMinutes()}`.slice(-2);

  return `${day} ${month} ${year} at ${hour}:${minute}`;
}
