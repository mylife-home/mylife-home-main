import React, { FunctionComponent, useMemo } from 'react';

import Typography from '@material-ui/core/Typography';

import { useCanvasTheme } from '../drawing/theme';
import { Rectangle } from '../drawing/types';
import { computeComponentRect } from '../drawing/shapes';
import { Selection } from '../types';
import CenterButton from './center-button';

import * as schema from '../../../files/schema';

interface ComponentProps {
  component: schema.Component;
  setSelection: (selection: Selection) => void;
}

const Component: FunctionComponent<ComponentProps> = ({ component, setSelection }) => {
  const componentCenterPosition = useCenterComponent(component);
  return (
    <div>
      <CenterButton position={componentCenterPosition} />
      <Typography>Selection {component.id}</Typography>
    </div>
  );
};

export default Component;

function useCenterComponent(component: schema.Component) {
  const theme = useCanvasTheme();
  return useMemo(() => {
    const rect = computeComponentRect(theme, component);
    return computeCenter(rect);
  }, [theme, component]);
}

function computeCenter(rect: Rectangle) {
  return {
    x: rect.x + rect.width / 2,
    y: rect.y + rect.height / 2
  };
}