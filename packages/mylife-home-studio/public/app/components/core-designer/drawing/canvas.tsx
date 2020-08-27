import React, { useContext, forwardRef } from 'react';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import { Konva, Stage, StageProps } from './konva';
import { CanvasThemeContext } from './theme';
import { ViewInfoContext } from './view-info';

const useStyles = makeStyles((theme) => ({
  container: {
    position: 'absolute',
    height: '100%',
    width: '100%',
  }
}));

const Canvas = forwardRef<Konva.Stage, StageProps>(({ children, className, ...props }, ref) => {
  const themeProps = useContext(CanvasThemeContext);
  const viewInfoProps = useContext(ViewInfoContext);
  const classes = useStyles();

  return (
    <Stage {...props} ref={ref} className={clsx(className, classes.container)}>
      <CanvasThemeContext.Provider value={themeProps}>
        <ViewInfoContext.Provider value={viewInfoProps}>
          {children}
        </ViewInfoContext.Provider>
      </CanvasThemeContext.Provider>
    </Stage>
  );
});

export default Canvas;
