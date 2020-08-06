import { Configuration } from 'webpack';
import merge from 'webpack-merge';
import base from './base';
import modes from './modes';
import client from './client';
import { Context } from '../../context';

export function prepareServerConfiguration(context: Context, partialConfiguration: Configuration) : Configuration {
  const modeConfiguration = modes(context)[context.mode];
  if (!modeConfiguration) {
    throw new Error(`Unsupported mode: ${context.mode}`);
  }

  const baseConfiguration = base(context);

  return merge(baseConfiguration, modeConfiguration, partialConfiguration);
}

export const prepareClientConfiguration = client;