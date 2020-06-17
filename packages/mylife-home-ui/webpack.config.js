const path    = require('path');
const webpack = require('webpack');

const BUILD_DIR = path.resolve(__dirname, 'public');
const APP_DIR   = path.resolve(__dirname, 'public/app');

const config = {
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
  
  entry: [ 'babel-polyfill', APP_DIR + '/main' ],

  output: {
    path: BUILD_DIR,
    filename: 'bundle.js'
  },

  resolve: {
    extensions: ['.wasm', '.mjs', '.js', '.ts', '.tsx', '.json']
  },

  module : {
    rules : [
      {
        test : /\.ts(x?)$/,
        use : [{ loader : 'babel-loader', query : babelQuery }, 'ts-loader' ]
      },
      {
        test : /\.js$/,
        use : [{ loader : 'babel-loader', query : babelQuery }]
      },
      {
        test: /\.css$/,
        use: [ 'style-loader', 'css-loader' ]
      },
      {
        test: /\.less$/,
        use: [ 'style-loader', 'css-loader', 'less-loader' ]
      },
      {
        test: /\.(png|jpg|gif|svg|eot|woff|woff2|ttf|ico)$/,
        use: [ 'file-loader' ]
      }
    ]
  },
};

module.exports = config;