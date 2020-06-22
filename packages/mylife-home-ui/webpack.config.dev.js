const path = require('path');
const base = require('./webpack.config.common');

module.exports = {
  ...base,
  mode: 'development',
  devtool: 'inline-source-map',
  devServer: {
    contentBase: path.join(__dirname, 'public'),
    host: '0.0.0.0',
    port: 8002,
    disableHostCheck: true,
    proxy: {
      '/resources': {
        target: 'http://localhost:8001'
      },
      '/socket.io': {
        target: 'http://localhost:8001',
        ws: true,
      }
    }
  }
};
