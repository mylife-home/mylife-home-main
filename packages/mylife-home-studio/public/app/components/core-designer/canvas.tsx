import React, { FunctionComponent, createContext, useContext } from 'react';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  wrapper: {
    position: 'absolute',
    height: '100%',
    width: '100%',
    overflow: 'auto',
  },
  container: {
    background: theme.palette.background.paper,
    position: 'relative',
  }
}));

export interface CanvasContextProps {
  gridSize: number;
}

const CanvasContext = createContext<CanvasContextProps>(null);

export const useCanvasContext = () => useContext(CanvasContext);

const CONTAINER_SIZE = 1000;

export interface CanvasProps {
  context: CanvasContextProps;
}

const Canvas: FunctionComponent<CanvasProps> = ({ children, context }) => {
  const classes = useStyles();

  const size = CONTAINER_SIZE * context.gridSize;
  const containerSize = { width: size, height: size };

  return (
    <div className={classes.wrapper}>
      <div className={classes.container} style={containerSize}>
        <CanvasContext.Provider value={context}>
          {children}
        </CanvasContext.Provider>
      </div>
    </div>
  );
};

export default Canvas;