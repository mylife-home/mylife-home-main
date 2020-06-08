'use strict';

const path = require('path');

module.exports = {
  mode: 'development',
  output: {
    path: path.resolve(__dirname, '..', 'dist', 'dev'),
  },
  devtool: 'inline-source-map',
};
