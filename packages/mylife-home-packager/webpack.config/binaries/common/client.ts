import path from 'path';
import glob from 'glob';
import { Configuration } from 'webpack';
import merge from 'webpack-merge';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import CopyPlugin from 'copy-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import { Context } from '../../context';
import TerserPlugin from 'terser-webpack-plugin';
import PurgecssPlugin from 'purgecss-webpack-plugin';
import CustomizedBundleAnalyzerPlugin from '../../plugins/customized-bundle-analyzer-plugin';
import { ConfigurationByMode } from './types';

export default (context: Context, repoName: string, binName: string, partialConfiguration: Configuration = {}) => {
    const babelOptions = {
      presets: [
        [require.resolve('@babel/preset-env'), { targets: { browsers: 'last 2 versions' } }],
        require.resolve('@babel/preset-react'),
      ]
    };

    const repoPath = path.dirname(require.resolve(`${repoName}/package.json`));
    const sourcePath = path.join(repoPath, 'public');
  
    const styleLoader = context.mode === 'prod' ? MiniCssExtractPlugin.loader : 'style-loader';
  
    const base: Configuration = {
      entry: `${repoName}/public/app/main`,
  
      output: {
        path: path.join(context.outputPath, `${binName}/static`),
      },
  
      resolve: {
        extensions: ['.wasm', '.mjs', '.js', '.ts', '.tsx', '.json'],
      },
  
      module: {
        rules: [
          {
            //https://github.com/webpack/webpack/issues/11467
            test: /\.m?js/,
            resolve: {
              fullySpecified: false
            }
          },
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
            { from: path.join(sourcePath, 'images'), to: 'images' },
          ],
        }),
        new HtmlWebpackPlugin({ template: path.join(sourcePath, 'index.ejs') })
      ]
    };
  
    const modes: ConfigurationByMode = {
      dev: {
        mode: 'development',
        devtool: 'inline-source-map',
        optimization: {
          splitChunks: {
            cacheGroups: {
              vendor: {
                test: /[\\/]node_modules[\\/]/,
                name: 'vendors',
                chunks: 'all',
              },
            },
          },
        }
      },
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
      },
    };
  
    const mode = modes[context.mode];
    if (!mode) {
      throw new Error(`Unsupported mode: '${context.mode}`);
    }
  
    return merge(base, mode, partialConfiguration);
  };
  