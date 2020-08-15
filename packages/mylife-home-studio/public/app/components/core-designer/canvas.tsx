import React, { FunctionComponent } from 'react';
import { useTheme as useMuiTheme } from '@material-ui/core/styles';
import { Stage, Layer } from 'react-konva';
import { CanvasThemeProvider } from './base/theme';

const Canvas: FunctionComponent = ({ children }) => {
  const muiTheme = useMuiTheme();
  
  return (
    <Stage width={window.innerWidth} height={window.innerHeight}>
      <CanvasThemeProvider muiTheme={muiTheme}>
        <Layer>
          {children}
        </Layer>
      </CanvasThemeProvider>
    </Stage>
    );
};

export default Canvas;
