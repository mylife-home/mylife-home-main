import { Context } from '../context';
import { prepareServerConfiguration, prepareClientConfiguration } from './common/tools';

export const bin = (context: Context) => prepareServerConfiguration(context, {
  entry: {
    'studio/bin': 'mylife-home-studio/dist/src/bin',
  },
});

export const client = (context: Context) => prepareClientConfiguration(context, 'mylife-home-studio');
