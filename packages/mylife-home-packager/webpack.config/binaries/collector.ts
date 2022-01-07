import { Context } from '../context';
import { prepareServerConfiguration } from './common/tools';

export const bin = (context: Context) => prepareServerConfiguration(context, {
  entry: {
    'collector/bin': 'mylife-home-collector/dist/bin',
  }
});
