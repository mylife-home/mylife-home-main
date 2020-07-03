import path from 'path';
import { Configuration } from 'webpack';
import merge from 'webpack-merge';
import TerserPlugin from 'terser-webpack-plugin';
import CopyPlugin from 'copy-webpack-plugin';
import CustomizedBundleAnalyzerPlugin from './customized-bundle-analyzer-plugin';
import { ConfigurationByMode } from './types';
import { Context } from './context';
import { prepareServerConfiguration } from './tools';

export default (context: Context) => {
  return [
    createClientConfiguration(context),
    prepareServerConfiguration(context, {
      entry: {
        'ui/bin': 'mylife-home-ui/dist/bin',
      },
    }),
  ];
};

function createClientConfiguration(context: Context) {
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
      path: path.join(context.outputPath, 'ui/static'),
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

  const mode = modes[context.env.mode];
  if (!mode) {
    throw new Error(`Unsupported mode: '${context.env.mode}`);
  }

  return merge(base, mode);
}
