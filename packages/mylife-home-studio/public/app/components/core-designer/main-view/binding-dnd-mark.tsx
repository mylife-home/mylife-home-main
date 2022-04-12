import React, { FunctionComponent, useCallback, useMemo } from 'react';
import { AppState } from '../../../store/types';
import { getComponent, makeGetComponentDefinitionProperties } from '../../../store/core-designer/selectors';
import { MemberType } from '../../../store/core-designer/types';

import { Point } from '../drawing/types';
import { Arrow } from '../drawing/konva';
import { useCanvasTheme } from '../drawing/theme';
import { useSafeSelector } from '../drawing/use-safe-selector';
import { computeBindingDndAnchor } from '../drawing/shapes';
import { useBindingDndInfo } from './binding-dnd';

const BindingDndMark: FunctionComponent = () => {
  const info = useBindingDndInfo();
  return info ? <Mark /> : null;
};

export default BindingDndMark;

const Mark: FunctionComponent = () => {
  const theme = useCanvasTheme();
  const { source, mousePosition } = useBindingDndInfo();
  const getComponentDefinitionProperties = useMemo(() => makeGetComponentDefinitionProperties(), []);
  const component = useSafeSelector(useCallback((state: AppState) => getComponent(state, source.componentId), [source.componentId]));
  const definition = useSafeSelector(useCallback((state: AppState) => getComponentDefinitionProperties(state, component.definition), [component.definition]));
  const anchor = computeBindingDndAnchor(theme, component, definition, source.memberName, mousePosition);
  const color = theme.bindingDndMarkColor;

  let from: Point;
  let to: Point;

  switch (source.memberType) {
    case MemberType.STATE:
      from = anchor;
      to = mousePosition;
      break;

    case MemberType.ACTION:
      from = mousePosition;
      to = anchor;
      break;
  }

  return (
    <Arrow
      listening={false}
      fill={color}
      stroke={color}
      points={[from.x, from.y, to.x, to.y]}
      pointerLength={theme.binding.pointerLength}
      pointerWidth={theme.binding.pointerWidth}
      strokeWidth={theme.binding.strokeWidth}
    />
  );
}
