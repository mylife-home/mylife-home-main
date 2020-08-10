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
    width: 10000,
    height: 10000,
    background: theme.palette.background.paper,
    position: 'relative',
  }
}));

export interface CanvasContextProps {
  gridSize: number;
}

const CanvasContext = createContext<CanvasContextProps>(null);

export const useCanvasContext = () => useContext(CanvasContext);

export interface CanvasProps {
  context: CanvasContextProps;
}

const Canvas: FunctionComponent<CanvasProps> = ({ children, context }) => {
  const classes = useStyles();

  return (
    <div className={classes.wrapper}>
      <div className={classes.container}>
        <CanvasContext.Provider value={context}>
          {children}
        </CanvasContext.Provider>
      </div>
    </div>
  );
};

export default Canvas;