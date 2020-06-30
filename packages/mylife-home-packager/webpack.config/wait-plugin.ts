// https://www.viget.com/articles/run-multiple-webpack-configs-sequentially/
const WebpackBeforeBuildPlugin = require('before-build-webpack'); // no types on it
import fs from 'fs';

export default class WaitPlugin extends WebpackBeforeBuildPlugin {
  constructor(file: string, interval = 100, timeout = 100000) {
    super(function (stats: any, callback: () => void) {
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
