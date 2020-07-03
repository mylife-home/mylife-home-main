import { Configuration } from 'webpack';
import merge from 'webpack-merge';
import base from './base';
import modes from './modes';
import { Context } from './context';

export function prepareServerConfiguration(context: Context, partialConfiguration: Configuration) : Configuration {
  const modeConfiguration = modes(context)[context.env.mode];
  if (!modeConfiguration) {
    throw new Error(`Unsupported mode: ${context.env.mode}`);
  }

  const baseConfiguration = base(context);

  return merge(baseConfiguration, modeConfiguration, partialConfiguration);
}