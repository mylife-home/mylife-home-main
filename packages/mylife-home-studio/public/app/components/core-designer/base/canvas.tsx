import React, { useContext, forwardRef } from 'react';
import clsx from 'clsx';
import { useTheme as useMuiTheme, makeStyles } from '@material-ui/core/styles';
import { Stage, StageProps } from 'react-konva';
import Konva from 'konva';

import { CanvasThemeProvider } from './theme';
import { ViewInfoContext } from './view-info';

const useStyles = makeStyles((theme) => ({
  container: {
    position: 'absolute',
    height: '100%',
    width: '100%',
  }
}));

const Canvas = forwardRef<Konva.Stage, StageProps>(({ children, className, ...props }, ref) => {
  const muiTheme = useMuiTheme();
  const viewInfoProps = useContext(ViewInfoContext);
  const classes = useStyles();

  return (
    <Stage {...props} ref={ref} className={clsx(className, classes.container)}>
      <CanvasThemeProvider muiTheme={muiTheme}>
        <ViewInfoContext.Provider value={viewInfoProps}>
          {children}
        </ViewInfoContext.Provider>
      </CanvasThemeProvider>
    </Stage>
  );
});

export default Canvas;
