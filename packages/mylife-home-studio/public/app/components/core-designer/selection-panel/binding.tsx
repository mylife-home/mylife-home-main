import React, { FunctionComponent, useCallback } from 'react';

import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';

import { Point } from '../drawing/types';
import { useCanvasTheme } from '../drawing/theme';
import { computeBindingAnchors } from '../drawing/shapes';
import { usePosition } from '../drawing/viewport-manips';
import { Selection } from '../types';

import * as schema from '../../../files/schema';

interface BindingProps {
  binding: schema.Binding;
  sourceComponent: schema.Component;
  targetComponent: schema.Component;

  setSelection: (selection: Selection) => void;
}

const Binding: FunctionComponent<BindingProps> = ({ binding, sourceComponent, targetComponent, setSelection }) => {
  const makeCenter = useCenterBinding();

  const handleSelectCenter = () => makeCenter(binding, sourceComponent, targetComponent);
  const handleSelectSource = () => setSelection({ type: 'component', id: binding.sourceComponent });
  const handleSelectTarget = () => setSelection({ type: 'component', id: binding.targetComponent });

  return (
    <div>
      <Button onClick={handleSelectCenter}>Binding</Button>
      <Button onClick={handleSelectSource}>{binding.sourceComponent}</Button>
      <Typography>{binding.sourceState}</Typography>
      <Button onClick={handleSelectTarget}>{binding.targetComponent}</Button>
      <Typography>{binding.targetAction}</Typography>
    </div>
  );
};

export default Binding;

function useCenterBinding() {
  const theme = useCanvasTheme();
  const { setLayerPosition } = usePosition();

  return useCallback((binding: schema.Binding, sourceComponent: schema.Component, targetComponent: schema.Component) => {
    const { sourceAnchor, targetAnchor } = computeBindingAnchors(theme, binding, sourceComponent, targetComponent);
    const position = computeCenter(sourceAnchor, targetAnchor);
    setLayerPosition(position);
  }, [theme, setLayerPosition]);
}

function computeCenter(a: Point, b: Point) {
  return {
    x: (a.x + b.x) / 2,
    y: (a.y + b.y) / 2
  };
}
