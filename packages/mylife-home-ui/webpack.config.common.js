const path    = require('path');

const BUILD_DIR = path.resolve(__dirname, 'public');
const APP_DIR   = path.resolve(__dirname, 'public/app');

const babelQuery = {

  presets: [
    [ require.resolve('@babel/preset-env'), { targets : 'last 2 versions' } ],
    require.resolve('@babel/preset-react')
  ],
  plugins: [
    require.resolve('@babel/plugin-proposal-export-default-from'),
    require.resolve('@babel/plugin-proposal-export-namespace-from'),
    require.resolve('@babel/plugin-proposal-class-properties')
  ]

};

module.exports = {
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
