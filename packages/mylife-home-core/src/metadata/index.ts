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

export { component, config, action, state } from './decorators';
export { getDescriptors, getDescriptor, ComponentDescriptor, ActionDescriptor, StateDescriptor } from './descriptors';
export { build } from './builder';
