import React, { FunctionComponent } from 'react';
import { darken, useTheme, ThemeProvider } from '@material-ui/core/styles';
import { Stage, Layer, Rect, Text, Group } from 'react-konva';

const GRID_STEP = 24;
const COMPONENT_WIDTH = 10;
const SELECTION_WIDTH = 2;
const FONT_FAMILY = '"Roboto", "Helvetica", "Arial", sans-serif';
const TEXT_PADDING = 8;

interface LabelProps {
  x: number;
  y: number;
  height: number;
  width: number;
  text: string;
  fontStyle?: string;
  backgroundColor: string;
}

const Label: FunctionComponent<LabelProps> =  ({x, y, height, width, text, fontStyle, backgroundColor }) => (
  <>
    <Rect x={x} y={y} width={width} height={height} fill={backgroundColor} />
    <Text x={x + TEXT_PADDING} y={y} width={width} height={height} 
      text={text} fill={'black'} fontFamily={FONT_FAMILY} fontSize={GRID_STEP * 0.6} fontStyle={fontStyle}
      verticalAlign={'middle'} />
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

export const KComponent: FunctionComponent<ComponentProps> = ({ x, y, title, states, actions, selected, onSelect }) => {
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

      <Label x={1} y={1} width={width-2} height={GRID_STEP - 2} backgroundColor={backgroundColor} fontStyle={'bold'} text={title} />

      {states.map((state, index) => (
        <Label key={index} x={1} y={GRID_STEP * (index + 1)} width={width-2} height={GRID_STEP - (index === states.length - 1 ? 1 : 0)} backgroundColor={backgroundColor} text={state} />
      ))}

      {actions.map((action, index) => (
        <Label key={index} x={1} y={GRID_STEP * (index + 1 + states.length)} width={width-2} height={GRID_STEP - (index === actions.length - 1 ? 1 : 0)} backgroundColor={backgroundColor} text={action} />
      ))}

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
