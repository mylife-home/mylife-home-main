import { components } from 'mylife-home-common';
import Type = components.metadata.Type;
import Range = components.metadata.Range;
import Text = components.metadata.Text;
import Float = components.metadata.Float;
import Bool = components.metadata.Bool;
import Enum = components.metadata.Enum;
import Complex = components.metadata.Complex;

export { Type, Range, Text, Float, Bool, Enum, Complex };

export { component, config, action, state } from './decorators';
export { getDescriptors, getDescriptor, ComponentDescriptor, ActionDescriptor, StateDescriptor } from './descriptors';
export { ConfigType } from './types';
export { build } from './builder';
