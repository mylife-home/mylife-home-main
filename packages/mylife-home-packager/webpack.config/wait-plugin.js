// https://www.viget.com/articles/run-multiple-webpack-configs-sequentially/
const WebpackBeforeBuildPlugin = require('before-build-webpack');
const fs = require('fs');

module.exports = class WaitPlugin extends WebpackBeforeBuildPlugin {
  constructor(file, interval = 100, timeout = 100000) {
    super(function (stats, callback) {
      let start = Date.now();

      function poll() {
        if (fs.existsSync(file)) {
          callback();
        } else if (Date.now() - start > timeout) {
          throw Error("Maybe it just wasn't meant to be.");
        } else {
          setTimeout(poll, interval);
        }
      }

      poll();
    });
  }
};
