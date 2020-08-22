import React, { FunctionComponent, useContext, forwardRef } from 'react';
import { useTheme as useMuiTheme } from '@material-ui/core/styles';
import { Stage, StageProps } from 'react-konva';
import Konva from 'konva';

import { CanvasThemeProvider } from './theme';
import { ViewInfoContext } from './view-info';

const Canvas: FunctionComponent<StageProps> = forwardRef<Konva.Stage>(({ children, ...props }, ref) => {
  const muiTheme = useMuiTheme();
  const viewInfoProps = useContext(ViewInfoContext);

  return (
    <Stage {...props} ref={ref}>
      <CanvasThemeProvider muiTheme={muiTheme}>
        <ViewInfoContext.Provider value={viewInfoProps}>
          {children}
        </ViewInfoContext.Provider>
      </CanvasThemeProvider>
    </Stage>
  );
});

export default Canvas;
