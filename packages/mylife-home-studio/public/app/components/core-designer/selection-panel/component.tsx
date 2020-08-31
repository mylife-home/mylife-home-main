import React, { FunctionComponent } from 'react';

import Typography from '@material-ui/core/Typography';

import { CanvasTheme } from '../drawing/theme';
import { GRID_STEP_SIZE } from '../drawing/defs';
import { Point } from '../drawing/types';
import { Selection } from '../types';

import * as schema from '../../../files/schema';

interface ComponentProps {
  component: schema.Component;
  setSelection: (selection: Selection) => void;
}

const Component: FunctionComponent<ComponentProps> = ({ component, setSelection }) => {
  return (
    <Typography>Selection {component.id}</Typography>
  );
};

export default Component;
/*
function useCenterComponent() {
  return useCallback
}

function computeComponentCenter(theme: CanvasTheme, component: schema.Component) {
  const height = (states.length + actions.length + 1) * theme.component.boxHeight;
  const width = theme.component.width;

  const x = component.x * GRID_STEP_SIZE
  const y = component.y * GRID_STEP_SIZE
}

function center(a: Point, b: Point) {
  
}
*/