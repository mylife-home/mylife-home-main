import React, { FunctionComponent, createContext, useContext, useMemo } from 'react';
import { Theme as MuiTheme, darken } from '@material-ui/core';

export interface CanvasTheme {
  layerSize: number;
  gridStep: number;
  fontFamily: string;
  fontSize: number;
  color: string;
  backgroundColor: string;
  borderColor: string;
  borderColorSelected: string;
  selectionWidth: number;

  component: {
    paddingLeft: number;
    width: number
  };
}

const CanvasTheme = createContext<CanvasTheme>(null);

export interface CanvasThemeProviderProps {
  muiTheme: MuiTheme;
}

export const CanvasThemeProvider: FunctionComponent<CanvasThemeProviderProps> = ({ muiTheme, ...props }) => {
  const canvasTheme = useMemo(() => buildCanvasTheme(muiTheme), [muiTheme]);

  return (
    <CanvasTheme.Provider {...props} value={canvasTheme} />
  );
}

export function useCanvasTheme() {
  return useContext(CanvasTheme);
}

export const GRID_STEP = 24;
export const LAYER_SIZE = 400 * GRID_STEP;

function buildCanvasTheme(muiTheme: MuiTheme) : CanvasTheme {
  return {
    layerSize: LAYER_SIZE,
    gridStep: GRID_STEP,
    fontFamily: muiTheme.typography.fontFamily,
    fontSize: GRID_STEP * 0.6,
    color: muiTheme.palette.text.primary,
    backgroundColor: darken(muiTheme.palette.background.paper, 0.03),
    borderColor: darken(muiTheme.palette.background.paper, 0.1),
    borderColorSelected: muiTheme.palette.primary.main,
    selectionWidth: 2,

    component: {
      paddingLeft: 8,
      width: GRID_STEP * 10,
    }
  };
}