import { IgnorePlugin } from 'webpack';
import { Context } from '../context';
import { prepareServerConfiguration, prepareClientConfiguration } from './common/tools';

export const bin = (context: Context) => prepareServerConfiguration(context, {
  entry: {
    'studio/bin': 'mylife-home-studio/dist/src/bin',
  },
  plugins: [
    new IgnorePlugin({
      checkResource(resource: string, context: string) {
        // ignore native dependency (package seems to have try logic to load it)
        if (context.endsWith('mylife-home-studio/node_modules/ssh2/lib/protocol') && resource === './crypto/build/Release/sshcrypto.node') {
          return true;
        }

        return false;
      }
    })
  ]
});

export const client = (context: Context) => prepareClientConfiguration(context, 'mylife-home-studio', 'studio', {
  module: {
    rules: [{ test: /\.css$/, use: ['style-loader', 'css-loader'] }],
  },
});
