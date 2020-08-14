import React, { FunctionComponent } from 'react';
import { darken, useTheme, ThemeProvider } from '@material-ui/core/styles';
import { Stage, Layer, Rect, Text, Group } from 'react-konva';
import Konva from 'konva';

const GRID_STEP = 24;
const COMPONENT_WIDTH = 10;
const SELECTION_WIDTH = 2;

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

export const KComponent: FunctionComponent<ComponentProps> = ({ x, y, states, actions, selected, onSelect }) => {
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

      <Rect
        x={0}
        y={0}
        width={width}
        height={height}
        fill={borderColor}
      />
    </Group>
  );
}

const KCanvas: FunctionComponent = ({ children }) => {
  const theme = useTheme();
  
  return (
    <Stage width={window.innerWidth} height={window.innerHeight}>
      <ThemeProvider theme={theme}>
        <Layer>
          {children}
        </Layer>
      </ThemeProvider>
    </Stage>
    );
};

export default KCanvas;
