'use strict';

const path = require('path');
const { DllPlugin, DllReferencePlugin } = require('webpack');
const WaitPlugin = require('./wait-plugin');

module.exports = (paths) => {
  return [{
    entry: {
      'ui/bin': 'mylife-home-ui/dist/bin',
    }
  }];
};
