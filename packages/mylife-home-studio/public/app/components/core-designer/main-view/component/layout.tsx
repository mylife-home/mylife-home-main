import React, { FunctionComponent, Children } from 'react';

import { Konva, Rect, Group } from '../../drawing/konva';
import { useCanvasTheme } from '../../drawing/theme';
import Typography from '../../drawing/typography';
import Border from '../../drawing/border';
import Icon, { Image } from '../../drawing/icon';
import { DragEventType } from '../binding-dnd';
import { Position } from '../../../../store/core-designer/types';

export const Title: FunctionComponent<{ text: string; }> = ({ text }) => {
  const theme = useCanvasTheme();

  const width = theme.component.width;
  const height = theme.component.boxHeight;
  
  return (
    <>
      <Typography x={theme.component.paddingLeft} y={0} width={width} height={height} text={text} bold />
      <Border x={0} y={0} width={width} height={height} color={theme.borderColor} type='inner' />
    </>
  );
};

interface PropertyProps {
  yIndex: number;
  onDrag?: (type: DragEventType, mousePosition: Position) => void; // if defined, then the propery becomes draggable
  icon: Image;
  primary: string;
  primaryItalic?: boolean;
  secondary?: string;
  secondaryItalic?: boolean;
  split?: 'middle' | 'right';
  highlight?: boolean;
}

export const Property: FunctionComponent<PropertyProps> = ({ yIndex, onDrag, icon, primary, primaryItalic = false, secondary, secondaryItalic = false, split, highlight }) => {
  const theme = useCanvasTheme();

  const xBase = theme.component.paddingLeft;
  const yBase = theme.component.boxHeight * yIndex;
  const xPrimary = xBase + theme.component.boxHeight; // icons are square
  const textsWidth = theme.component.width - xPrimary - theme.component.paddingLeft;

  let xSecondary: number;
  let primaryWidth: number;
  let secondaryWidth: number;

  switch (split) {
    case 'middle':
      primaryWidth = secondaryWidth = (textsWidth / 2) - theme.component.paddingLeft; // padding between
      xSecondary = xPrimary + primaryWidth + theme.component.paddingLeft;
      break;

    case 'right':
      secondaryWidth = theme.component.secondaryWidth;
      xSecondary = theme.component.width - theme.component.secondaryWidth - theme.component.paddingLeft;
      primaryWidth = xSecondary - xPrimary - theme.component.paddingLeft; // padding between
      break;

    default:
      secondaryWidth = null;
      xSecondary = null;
      primaryWidth = textsWidth;
      break;
  }

  const createDragEventHandler = (type: DragEventType) => {
    if (!onDrag) {
      return;
    }

    return (e: Konva.KonvaEventObject<DragEvent>) => {
      e.cancelBubble = true;
      onDrag(type, { x: e.evt.x, y: e.evt.y });
    };
  };

  return (
    <Group
      x={0} y={yBase} width={theme.component.width} height={theme.component.boxHeight}
      draggable={!!onDrag} onDragStart={createDragEventHandler('start')} onDragMove={createDragEventHandler('move')} onDragEnd={createDragEventHandler('end')}
    >
      {highlight && (
        <Rect x={0} y={0} width={theme.component.width} height={theme.component.boxHeight} fill={theme.component.highlightColor} />
      )}

      <Icon x={xBase} y={((theme.component.boxHeight - (theme.fontSize)) / 2)} size={theme.fontSize} image={icon} />

      <Typography x={xPrimary} y={0} height={theme.component.boxHeight} width={primaryWidth} text={primary} italic={primaryItalic} />

      {secondaryWidth && (
        <Typography x={xSecondary} y={0} height={theme.component.boxHeight} width={secondaryWidth} text={secondary} italic={secondaryItalic} />
      )}
    </Group>
  );
};

export const BorderGroup: FunctionComponent<{ yIndex: number; }> = ({ yIndex, children }) =>  {
  const theme = useCanvasTheme();

  const childrenCount = Children.count(children);

  return (
    <>
      <Border x={0} y={(theme.component.boxHeight * yIndex) - 1} width={theme.component.width} height={theme.component.boxHeight * childrenCount + 1} color={theme.borderColor} type='inner' />
      {children}
    </>
  );
};