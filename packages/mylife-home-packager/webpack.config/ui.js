'use strict';

const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = (paths) => {
  return [
    (env, argv) => createClientConfiguration(env, argv, paths),
    {
      entry: {
        'ui/bin': 'mylife-home-ui/dist/bin',
      },
    },
  ];
};

function createClientConfiguration(env, argv, paths) {
  const babelOptions = {
    presets: [
      [require.resolve('@babel/preset-env'), { targets: 'last 2 versions' }],
      require.resolve('@babel/preset-react'),
    ]
  };

  const base = {
    entry: 'mylife-home-ui/public/app/main',

    output: {
      path: path.join(paths.output, 'ui/static'),
      filename: 'bundle.js',
    },

    resolve: {
      extensions: ['.wasm', '.mjs', '.js', '.ts', '.tsx', '.json'],
    },

    module: {
      rules: [
        {
          test: /\.ts(x?)$/,
          use: [
            { loader: 'babel-loader', options: babelOptions },
            { loader: 'ts-loader', options: { configFile: require.resolve('mylife-home-ui/public/tsconfig.json') } },
          ],
        },
        { test: /\.js$/, use: [{ loader: 'babel-loader', options: babelOptions }] },
        { test: /\.css$/, use: ['style-loader', 'css-loader'] },
        { test: /\.less$/, use: ['style-loader', 'css-loader', 'less-loader'] },
        { test: /\.(png|jpg|gif|svg|eot|woff|woff2|ttf|ico)$/, use: ['file-loader'] },
      ],
    },
  };

  const modes = {
    dev: {
      ...base,
      mode: 'development',
      devtool: 'inline-source-map',
      /*
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
    */
    },
    prod: {
      ...base,
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
    },
  };

  const config = modes[env.mode];
  if (!config) {
    throw new Error(`Unsupported mode: '${env.mode}`);
  }

  return config;
}
