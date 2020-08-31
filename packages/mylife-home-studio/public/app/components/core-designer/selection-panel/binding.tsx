import React, { FunctionComponent, useMemo } from 'react';

import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';

import { Point } from '../drawing/types';
import { useCanvasTheme } from '../drawing/theme';
import { computeBindingAnchors } from '../drawing/shapes';
import { Selection } from '../types';
import CenterButton from './center-button';

import * as schema from '../../../files/schema';

interface BindingProps {
  binding: schema.Binding;
  sourceComponent: schema.Component;
  targetComponent: schema.Component;

  setSelection: (selection: Selection) => void;
}

const Binding: FunctionComponent<BindingProps> = ({ binding, sourceComponent, targetComponent, setSelection }) => {
  const componentBindingPosition = useCenterBinding(binding, sourceComponent, targetComponent);

  const handleSelectSource = () => setSelection({ type: 'component', id: binding.sourceComponent });
  const handleSelectTarget = () => setSelection({ type: 'component', id: binding.targetComponent });

  return (
    <div>
      <CenterButton position={componentBindingPosition} />
      <Button onClick={handleSelectSource}>{binding.sourceComponent}</Button>
      <Typography>{binding.sourceState}</Typography>
      <Button onClick={handleSelectTarget}>{binding.targetComponent}</Button>
      <Typography>{binding.targetAction}</Typography>
    </div>
  );
};

export default Binding;

function useCenterBinding(binding: schema.Binding, sourceComponent: schema.Component, targetComponent: schema.Component) {
  const theme = useCanvasTheme();

  return useMemo(() => {
    const { sourceAnchor, targetAnchor } = computeBindingAnchors(theme, binding, sourceComponent, targetComponent);
    return computeCenter(sourceAnchor, targetAnchor);
  }, [theme, binding, sourceComponent, targetComponent]);
}

function computeCenter(a: Point, b: Point) {
  return {
    x: (a.x + b.x) / 2,
    y: (a.y + b.y) / 2
  };
}
