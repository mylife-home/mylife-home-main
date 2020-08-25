import React, { FunctionComponent, useCallback } from 'react';
import { Rect, Group } from 'react-konva';
import Konva from 'konva';

import { useCanvasTheme } from './base/theme';
import * as schema from '../../files/schema';

export interface BindingProps {
  sourceComponent: schema.Component;
  targetComponent: schema.Component;
  sourceState: string;
  targetAction: string;
}

const Binding: FunctionComponent<BindingProps> = ({ sourceComponent, targetComponent, sourceState, targetAction }) => {

  return null;
};

export default Binding;
