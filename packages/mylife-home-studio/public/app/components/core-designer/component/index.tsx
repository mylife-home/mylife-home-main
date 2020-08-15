import React, { FunctionComponent, Fragment } from 'react';
import { darken, useTheme } from '@material-ui/core/styles';
import { Rect, Group } from 'react-konva';

import Icon from '../base/icon';
import Typography from '../base/typography';
import { GRID_STEP } from '../base/defs';

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
  backgroundColor: string;
  color: string;
}

const Label: FunctionComponent<LabelProps> = ({x, y, height, width, text, header, backgroundColor, color }) => (
  <>
    <Rect x={x} y={y} width={width} height={height} fill={backgroundColor} />
    <Typography x={x + TEXT_PADDING + (header ? 0 : GRID_STEP) } y={y} width={width} height={height} text={text} color={color} bold={header} />
  </>
);

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
  const theme = useTheme();
  const backgroundColor = darken(theme.palette.background.paper, 0.03);
  const borderColor = darken(theme.palette.background.paper, 0.1);
  const borderColorSelected = theme.palette.primary.main;

  const height = (states.length + actions.length + 1) * GRID_STEP;
  const width = COMPONENT_WIDTH * GRID_STEP;

  return (
    <Group
      x={x * GRID_STEP}
      y={y * GRID_STEP}
      width={width}
      height={height}
      onClick={onSelect}
    >
      {selected && (
        <Rect
          x={-SELECTION_WIDTH}
          y={-SELECTION_WIDTH}
          width={width + 2 * SELECTION_WIDTH}
          height={height + 2 * SELECTION_WIDTH}
          fill={borderColorSelected} />
      )}

      <Rect x={0} y={0} width={width} height={height} fill={borderColor} />

      <Label x={1} y={1} width={width-2} height={GRID_STEP - 2} backgroundColor={backgroundColor} header text={title} color='black' />

      {states.map((state, index) => (
        <Fragment key={index}>
          <Label x={1} y={GRID_STEP * (index + 1)} width={width-2} height={GRID_STEP - (index === states.length - 1 ? 1 : 0)} backgroundColor={backgroundColor} text={state} color='black' />
          <Icon x={TEXT_PADDING} y={GRID_STEP * (index + 1) + ((GRID_STEP - (GRID_STEP * 0.6)) / 2)} size={GRID_STEP * 0.6} image='visibility' color='black' />
        </Fragment>
      ))}

      {actions.map((action, index) => (
        <Fragment key={index}>
          <Label x={1} y={GRID_STEP * (index + 1 + states.length)} width={width-2} height={GRID_STEP - (index === actions.length - 1 ? 1 : 0)} backgroundColor={backgroundColor} text={action} color='black' />
          <Icon x={TEXT_PADDING} y={GRID_STEP * (index + 1 + states.length) + ((GRID_STEP - (GRID_STEP * 0.6)) / 2)} size={GRID_STEP * 0.6} image='input' color='black' />
        </Fragment>
      ))}

    </Group>
  );
}

export default Component;