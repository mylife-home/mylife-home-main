import React, { FunctionComponent, useCallback } from 'react';

import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';

import { useCanvasTheme } from '../drawing/theme';
import { Rectangle } from '../drawing/types';
import { computeComponentRect } from '../drawing/shapes';
import { usePosition } from '../drawing/viewport-manips';
import { Selection } from '../types';

import * as schema from '../../../files/schema';

interface ComponentProps {
  component: schema.Component;
  setSelection: (selection: Selection) => void;
}

const Component: FunctionComponent<ComponentProps> = ({ component, setSelection }) => {
  const makeCenter = useCenterComponent();
  return (
    <Button onClick={() => makeCenter(component)}>Selection {component.id}</Button>
  );
};

export default Component;

function useCenterComponent() {
  const theme = useCanvasTheme();
  const { setLayerPosition } = usePosition();

  return useCallback((component: schema.Component) => {
    const rect = computeComponentRect(theme, component);
    const position = computeCenter(rect);
    setLayerPosition(position);
  }, [theme, setLayerPosition]);
}

function computeCenter(rect: Rectangle) {
  return {
    x: rect.x + rect.width / 2,
    y: rect.y + rect.height / 2
  };
}