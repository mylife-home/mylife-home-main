import { CanvasTheme } from './theme';
import { Rectangle } from './types';
import { GRID_STEP_SIZE } from './defs';

import * as schema from '../../../files/schema';

export function computeComponentRect(theme: CanvasTheme, component: schema.Component): Rectangle {
  return {
    x: component.x * GRID_STEP_SIZE,
    y: component.y * GRID_STEP_SIZE,
    height: (component.states.length + component.actions.length + 1) * theme.component.boxHeight,
    width: theme.component.width,
  };
}

