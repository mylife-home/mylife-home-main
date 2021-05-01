import React, { FunctionComponent } from 'react';
import { AppState } from '../../../store/types';
import { getComponent, getPlugin } from '../../../store/core-designer/selectors';
import { MemberType } from '../../../store/core-designer/types';

import { useTabPanelId } from '../../lib/tab-panel';
import { Point } from '../drawing/types';
import { Arrow } from '../drawing/konva';
import { useCanvasTheme } from '../drawing/theme';
import { useSafeSelector } from '../drawing/use-safe-selector';
import { computeBindingDndAnchor } from '../drawing/shapes';
import { useBindingDndInfo } from './binding-dnd';

const BindingDndMark: FunctionComponent = () => {
  const theme = useCanvasTheme();
  const info = useBindingDndInfo();
  return info ? <Mark /> : null;
};

export default BindingDndMark;

const Mark: FunctionComponent = () => {
  const theme = useCanvasTheme();
  const { source, mousePosition } = useBindingDndInfo();
  const tabId = useTabPanelId();
  const component = useSafeSelector((state: AppState) => getComponent(state, tabId, source.componentId));
  const plugin = useSafeSelector((state: AppState) => getPlugin(state, tabId, component.plugin));
  const anchor = computeBindingDndAnchor(theme, component, plugin, source.memberName, mousePosition);
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
