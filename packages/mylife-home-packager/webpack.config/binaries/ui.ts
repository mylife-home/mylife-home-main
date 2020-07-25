import path from 'path';
import glob from 'glob';
import { Configuration } from 'webpack';
import merge from 'webpack-merge';
import TerserPlugin from 'terser-webpack-plugin';
import CopyPlugin from 'copy-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import PurgecssPlugin from 'purgecss-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import CustomizedBundleAnalyzerPlugin from '../plugins/customized-bundle-analyzer-plugin';
import { ConfigurationByMode } from './common/types';
import { Context } from '../context';
import { prepareServerConfiguration } from './common/tools';

export const bin = (context: Context) => prepareServerConfiguration(context, {
  entry: {
    'ui/bin': 'mylife-home-ui/dist/src/bin',
  },
});

export const client = (context: Context) => {
  const babelOptions = {
    presets: [
      [require.resolve('@babel/preset-env'), { targets: 'last 2 versions' }],
      require.resolve('@babel/preset-react'),
    ]
  };

  const repoPath = path.dirname(require.resolve('mylife-home-ui/package.json'));
  const sourcePath = path.join(repoPath, 'public');

  const styleLoader = context.mode === 'prod' ? MiniCssExtractPlugin.loader : 'style-loader';

  const base = {
    entry: 'mylife-home-ui/public/app/main',

    output: {
      path: path.join(context.outputPath, 'ui/static'),
      filename: 'bundle.js',
    },

    resolve: {
      extensions: ['.wasm', '.mjs', '.js', '.ts', '.tsx', '.json'],

      // https://preactjs.com/guide/v10/getting-started#aliasing-react-to-preact
      alias: { 
        "react": "preact/compat",
        "react-dom/test-utils": "preact/test-utils",
        "react-dom": "preact/compat",
      },
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
        { test: /\.scss$/, use: [styleLoader, 'css-loader', 'sass-loader'] },
        { test: /\.(png|jpg|gif|svg|eot|woff|woff2|ttf|ico)$/, use: ['file-loader'] },
      ],
    },

    plugins: [
      new CopyPlugin({
        patterns: [
          //{ from: path.join(sourcePath, 'index.html') },
          { from: path.join(sourcePath, 'images'), to: 'images' },
        ],
      }),
      new HtmlWebpackPlugin({ template: path.join(sourcePath, 'index.ejs') })
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
      plugins: [
        new MiniCssExtractPlugin(),
        new PurgecssPlugin({ paths: glob.sync(`${sourcePath}/**/*`, { nodir: true }) }),
        new CustomizedBundleAnalyzerPlugin({ analyzerMode: 'static' })
      ],
    } as Configuration,
  } as ConfigurationByMode;

  const mode = modes[context.mode];
  if (!mode) {
    throw new Error(`Unsupported mode: '${context.mode}`);
  }

  return merge(base, mode);
};
