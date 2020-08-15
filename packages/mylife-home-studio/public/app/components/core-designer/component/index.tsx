import React, { FunctionComponent, Fragment } from 'react';
import { Rect, Group } from 'react-konva';

import { useCanvasTheme } from '../base/theme';
import Icon from '../base/icon';
import Typography from '../base/typography';
import Border from '../base/border';
import Title from './title';

const COMPONENT_WIDTH = 10;
const SELECTION_WIDTH = 2;
const TEXT_PADDING = 8;

interface LabelProps {
  x: number;
  y: number;
  height: number;
  width: number;
  text: string;
  header?: boolean;
}

const Label: FunctionComponent<LabelProps> = ({x, y, height, width, text, header }) => {
  const theme = useCanvasTheme();
  
  return (
    <Typography x={x + TEXT_PADDING + (header ? 0 : theme.gridStep) } y={y} width={width} height={height} text={text} bold={header} />
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
  const width = COMPONENT_WIDTH * theme.gridStep;

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
          thickness={SELECTION_WIDTH}
        />
      )}

      <Title x={1} y={1} width={width-2} height={theme.gridStep - 2} text={title} />

      {states.map((state, index) => (
        <Fragment key={index}>
          <Label x={1} y={theme.gridStep * (index + 1)} width={width-2} height={theme.gridStep - (index === states.length - 1 ? 1 : 0)} text={state} />
          <Icon x={TEXT_PADDING} y={theme.gridStep * (index + 1) + ((theme.gridStep - (theme.gridStep * 0.6)) / 2)} size={theme.gridStep * 0.6} image='visibility' />
        </Fragment>
      ))}

      {actions.map((action, index) => (
        <Fragment key={index}>
          <Label x={1} y={theme.gridStep * (index + 1 + states.length)} width={width-2} height={theme.gridStep - (index === actions.length - 1 ? 1 : 0)} text={action} />
          <Icon x={TEXT_PADDING} y={theme.gridStep * (index + 1 + states.length) + ((theme.gridStep - (theme.gridStep * 0.6)) / 2)} size={theme.gridStep * 0.6} image='input' />
        </Fragment>
      ))}

      <Border x={0} y={0} width={width} height={theme.gridStep} color={theme.borderColor} type='inner' />

      <Border x={0} y={theme.gridStep - 1} width={width} height={theme.gridStep * states.length + 1} color={theme.borderColor} type='inner' />

      <Border x={0} y={theme.gridStep * (1 + states.length) - 1} width={width} height={theme.gridStep * actions.length + 1} color={theme.borderColor} type='inner' />

    </Group>
  );
}

export default Component;