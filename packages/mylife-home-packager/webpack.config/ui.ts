import path from 'path';
import merge from 'webpack-merge';
import TerserPlugin from 'terser-webpack-plugin';
import CopyPlugin from 'copy-webpack-plugin';
import CustomizedBundleAnalyzerPlugin from './customized-bundle-analyzer-plugin';
import { Paths, Arguments, Environment, ConfigurationByMode } from './types';
import { Configuration } from 'webpack';

export default (paths: Paths) => {
  return [
    (env: Environment, argv: Arguments) => createClientConfiguration(env, argv, paths),
    {
      entry: {
        'ui/bin': 'mylife-home-ui/dist/bin',
      },
    },
  ];
};

function createClientConfiguration(env: Environment, argv: Arguments, paths: Paths) {
  const babelOptions = {
    presets: [
      [require.resolve('@babel/preset-env'), { targets: 'last 2 versions' }],
      require.resolve('@babel/preset-react'),
    ]
  };

  const repoPath = path.dirname(require.resolve('mylife-home-ui/package.json'));
  const sourcePath = path.join(repoPath, 'public');

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
            { loader: 'ts-loader', options: { configFile: path.join(sourcePath, 'tsconfig.json') } },
          ],
        },
        { test: /\.js$/, use: [{ loader: 'babel-loader', options: babelOptions }] },
        { test: /\.css$/, use: ['style-loader', 'css-loader'] },
        { test: /\.less$/, use: ['style-loader', 'css-loader', 'less-loader'] },
        { test: /\.(png|jpg|gif|svg|eot|woff|woff2|ttf|ico)$/, use: ['file-loader'] },
      ],
    },

    plugins: [
      new CopyPlugin({
        patterns: [
          { from: path.join(sourcePath, 'index.html') },
          { from: path.join(sourcePath, 'images'), to: 'images' },
        ],
      })
    ]
  };

  const modes = {
    dev: {
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
    } as Configuration,
    prod: {
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
      plugins: [new CustomizedBundleAnalyzerPlugin({ analyzerMode: 'static' })],
    } as Configuration,
  } as ConfigurationByMode;

  const mode = modes[env.mode];
  if (!mode) {
    throw new Error(`Unsupported mode: '${env.mode}`);
  }

  return merge(base, mode);
}
