import React, { FunctionComponent, createContext, useContext, useMemo } from 'react';
import { Theme as MuiTheme, darken } from '@material-ui/core';

export interface CanvasTheme {
  gridStep: number;
  fontFamily: string;
  fontSize: number;
  color: string;
  backgroundColor: string;
  borderColor: string;
  borderColorSelected: string;
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

const GRID_STEP = 24;

function buildCanvasTheme(muiTheme: MuiTheme) : CanvasTheme {
  return {
    gridStep: GRID_STEP,
    fontFamily: muiTheme.typography.fontFamily,
    fontSize: GRID_STEP * 0.6,
    color: 'black',
    backgroundColor: darken(muiTheme.palette.background.paper, 0.03),
    borderColor: darken(muiTheme.palette.background.paper, 0.1),
    borderColorSelected: muiTheme.palette.primary.main,
  };
}