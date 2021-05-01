import React, { FunctionComponent, createContext, useContext, useMemo } from 'react';
import { Theme as MuiTheme, useTheme as useMuiTheme, darken } from '@material-ui/core';
import { fade } from '@material-ui/core/styles';
import orange from '@material-ui/core/colors/orange';
import { GRID_STEP_SIZE } from './defs';

export interface CanvasTheme {
  fontFamily: string;
  fontSize: number;
  color: string;
  backgroundColor: string;
  backgroundColorExternal: string;
  borderColor: string;
  borderColorExternal: string;
  borderColorSelected: string;
  selectionWidth: number;
  bindingDndMarkColor: string;

  component: {
    boxHeight: number;
    paddingLeft: number;
    width: number;
    secondaryWidth: number;
    highlightColor: string;
  };

  binding: {
    pointerWidth: number;
    pointerLength: number;
    strokeWidth: number;
  };

}

export const CanvasThemeContext = createContext<CanvasTheme>(null);

export const CanvasThemeProvider: FunctionComponent = (props) => {
  const muiTheme = useMuiTheme();
  const canvasTheme = useMemo(() => buildCanvasTheme(muiTheme), [muiTheme]);

  return (
    <CanvasThemeContext.Provider {...props} value={canvasTheme} />
  );
}

export function useCanvasTheme() {
  return useContext(CanvasThemeContext);
}

function buildCanvasTheme(muiTheme: MuiTheme) : CanvasTheme {
  return {
    fontFamily: muiTheme.typography.fontFamily,
    fontSize: GRID_STEP_SIZE * 0.6,
    color: muiTheme.palette.text.primary,
    backgroundColor: darken(muiTheme.palette.background.paper, 0.03),
    backgroundColorExternal: fade(orange[300], 0.1),
    borderColor: darken(muiTheme.palette.background.paper, 0.1),
    borderColorExternal: fade(orange[300], 0.2),
    borderColorSelected: muiTheme.palette.primary.main,
    selectionWidth: 2,
    bindingDndMarkColor: darken(muiTheme.palette.background.paper, 0.5),

    component: {
      boxHeight: GRID_STEP_SIZE,
      paddingLeft: 8,
      width: GRID_STEP_SIZE * 10,
      secondaryWidth: 40,
      highlightColor: darken(muiTheme.palette.background.paper, 0.3),
    },

    binding: {
      pointerWidth: 5,
      pointerLength: 5,
      strokeWidth: 2,
    }
  };
}