import { components } from 'mylife-home-common';
import Type = components.metadata.Type;
import Range = components.metadata.Range;
import Text = components.metadata.Text;
import Float = components.metadata.Float;
import Bool = components.metadata.Bool;
import Enum = components.metadata.Enum;
import Complex = components.metadata.Complex;
import PluginUsage = components.metadata.PluginUsage;
import ConfigType = components.metadata.ConfigType;

export { Type, Range, Text, Float, Bool, Enum, Complex, PluginUsage, ConfigType };

export * from './decorators';
export { LocalPlugin } from './builder';

import * as importBuilder from './builder';
export const builder = { init: importBuilder.init, terminate: importBuilder.terminate, build: importBuilder.build };
