import React, { FunctionComponent } from 'react';
import { useTheme, ThemeProvider } from '@material-ui/core/styles';
import { Stage, Layer } from 'react-konva';

const Canvas: FunctionComponent = ({ children }) => {
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

export default Canvas;
