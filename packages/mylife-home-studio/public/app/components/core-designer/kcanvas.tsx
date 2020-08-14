import React, { FunctionComponent, Fragment } from 'react';
import { darken, useTheme, ThemeProvider } from '@material-ui/core/styles';
import { Stage, Layer, Rect, Text, Group, Path } from 'react-konva';

const GRID_STEP = 24;
const COMPONENT_WIDTH = 10;
const SELECTION_WIDTH = 2;
const FONT_FAMILY = '"Roboto", "Helvetica", "Arial", sans-serif';
const TEXT_PADDING = 8;

interface PathImageProps {
  path: string;
  x: number;
  y: number;
  size: number;
}

const PATH_SIZE = 24;

const VISIBILITY_PATH = "M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z";
const INPUT_PATH = "M21 3.01H3c-1.1 0-2 .9-2 2V9h2V4.99h18v14.03H3V15H1v4.01c0 1.1.9 1.98 2 1.98h18c1.1 0 2-.88 2-1.98v-14c0-1.11-.9-2-2-2zM11 16l4-4-4-4v3H1v2h10v3z";

const PathImage: FunctionComponent<PathImageProps> = ({ path, x, y, size }) => (
  <Path
    x={x}
    y={y}
    width={size}
    height={size}
    scaleX={size / PATH_SIZE}
    scaleY={size / PATH_SIZE}
    data={path}
    fill={'black'}
  />
);

interface LabelProps {
  x: number;
  y: number;
  height: number;
  width: number;
  text: string;
  header?: boolean;
  backgroundColor: string;
}

const Label: FunctionComponent<LabelProps> = ({x, y, height, width, text, header, backgroundColor }) => (
  <>
    <Rect x={x} y={y} width={width} height={height} fill={backgroundColor} />
    <Text x={x + TEXT_PADDING + (header ? 0 : GRID_STEP) } y={y} width={width} height={height} 
      text={text} fill={'black'} fontFamily={FONT_FAMILY} fontSize={GRID_STEP * 0.6} fontStyle={header && 'bold'}
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

      <Label x={1} y={1} width={width-2} height={GRID_STEP - 2} backgroundColor={backgroundColor} header text={title} />

      {states.map((state, index) => (
        <Fragment key={index}>
          <Label x={1} y={GRID_STEP * (index + 1)} width={width-2} height={GRID_STEP - (index === states.length - 1 ? 1 : 0)} backgroundColor={backgroundColor} text={state} />
          <PathImage x={TEXT_PADDING} y={GRID_STEP * (index + 1) + ((GRID_STEP - (GRID_STEP * 0.6)) / 2)} size={GRID_STEP * 0.6} path={VISIBILITY_PATH} />
        </Fragment>
      ))}

      {actions.map((action, index) => (
        <Fragment key={index}>
          <Label x={1} y={GRID_STEP * (index + 1 + states.length)} width={width-2} height={GRID_STEP - (index === actions.length - 1 ? 1 : 0)} backgroundColor={backgroundColor} text={action} />
          <PathImage x={TEXT_PADDING} y={GRID_STEP * (index + 1 + states.length) + ((GRID_STEP - (GRID_STEP * 0.6)) / 2)} size={GRID_STEP * 0.6} path={INPUT_PATH} />
        </Fragment>
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
