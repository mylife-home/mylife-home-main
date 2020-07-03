import { Configuration } from 'webpack';
import TerserPlugin from 'terser-webpack-plugin';
import { ConfigurationByMode } from './types';
import { Context } from './context';
import CustomizedBundleAnalyzerPlugin from './customized-bundle-analyzer-plugin';

export default (context: Context) => ({
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
  dev: {
    mode: 'development',
    devtool: 'inline-source-map',
  } as Configuration,
}) as ConfigurationByMode;
