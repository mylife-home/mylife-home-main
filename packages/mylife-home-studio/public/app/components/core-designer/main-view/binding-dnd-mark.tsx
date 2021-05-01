import React, { FunctionComponent } from 'react';

import { useCanvasTheme } from '../drawing/theme';
//import Border from '../drawing/border';
//import { computeComponentRect } from '../drawing/shapes';
import { useBindingDndInfo } from './binding-dnd';

const BindingDndMark: FunctionComponent = () => {
  const theme = useCanvasTheme();
  const info = useBindingDndInfo();
  if (!info) {
    return null;
  }

  // TODO
  return null;
};

export default BindingDndMark;
