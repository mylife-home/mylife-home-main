import React, { FunctionComponent, Fragment } from 'react';
import { Rect, Group } from 'react-konva';

import { useCanvasTheme } from '../base/theme';
import Icon, { Image } from '../base/icon';
import Typography from '../base/typography';
import Border from '../base/border';
import Title from './title';

interface PropertyProps {
  yIndex: number;
  icon: Image;
  text: string;
}

const Property: FunctionComponent<PropertyProps> = ({ yIndex, icon, text }) => {
  const theme = useCanvasTheme();

  const xBase = theme.component.paddingLeft;
  const yBase = theme.gridStep * yIndex;
  const xTypo = xBase + theme.gridStep;

  return (
    <>
      <Icon x={xBase} y={yBase + ((theme.gridStep - (theme.fontSize)) / 2)} size={theme.fontSize} image={icon} />
      <Typography x={xTypo} y={yBase} height={theme.gridStep} width={theme.component.width - xTypo} text={text} />
    </>
  );
};

export interface ComponentProps {
  id: string;
  x: number;
  y: number;
  selected?: boolean;
  title: string;
  states: string[];
  actions: string[];

  onSelect: () => void;
}

const Component: FunctionComponent<ComponentProps> = ({ x, y, title, states, actions, selected, onSelect }) => {
  const theme = useCanvasTheme();

  const height = (states.length + actions.length + 1) * theme.gridStep;
  const width = theme.component.width;

  return (
    <Group
      x={x * theme.gridStep}
      y={y * theme.gridStep}
      width={width}
      height={height}
      onClick={onSelect}
    >
      <Rect x={0} y={0} width={width} height={height} fill={theme.backgroundColor} />

      {selected && (
        <Border
          x={0}
          y={0}
          width={width}
          height={height}
          type='outer'
          color={theme.borderColorSelected}
          thickness={theme.selectionWidth}
        />
      )}

      <Title text={title} />
      <Border x={0} y={0} width={width} height={theme.gridStep} color={theme.borderColor} type='inner' />

      {states.length && (
        <>
          {states.map((state, index) => (
            <Property key={index} yIndex={1 + index} icon='visibility' text={state} />
          ))}

          <Border x={0} y={theme.gridStep - 1} width={width} height={theme.gridStep * states.length + 1} color={theme.borderColor} type='inner' />
        </>
      )}

      {actions.length && (
        <>
          {actions.map((action, index) => (
            <Property key={index} yIndex={1 + index + states.length} icon='input' text={action} />
          ))}

          <Border x={0} y={theme.gridStep * (1 + states.length) - 1} width={width} height={theme.gridStep * actions.length + 1} color={theme.borderColor} type='inner' />
        </>
      )}

    </Group>
  );
}

export default Component;