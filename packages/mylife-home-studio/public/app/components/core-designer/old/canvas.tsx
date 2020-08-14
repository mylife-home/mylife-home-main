import React, { FunctionComponent, createContext, useContext } from 'react';
import { useDrop, DropTargetMonitor } from 'react-dnd';
import { makeStyles } from '@material-ui/core/styles';

import { DndItemTypes, ComponentDragItem, computeComponentPosition, Position } from './dnd';

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
  onMoveComponent: (id: string, pos: Position) => void;
}

const Canvas: FunctionComponent<CanvasProps> = ({ children, context, onMoveComponent }) => {
  const classes = useStyles();

  const size = CONTAINER_SIZE * context.gridSize;
  const containerSize = { width: size, height: size };

  const [, drop] = useDrop({
    accept: DndItemTypes.COMPONENT,
    drop(item: ComponentDragItem, monitor: DropTargetMonitor) {
      const delta = monitor.getDifferenceFromInitialOffset();
      onMoveComponent(item.id, computeComponentPosition(item, delta, context.gridSize));
    },
  });
  
  return (
    <div className={classes.wrapper}>
      <div ref={drop} className={classes.container} style={containerSize}>
        <CanvasContext.Provider value={context}>
          {children}
        </CanvasContext.Provider>
      </div>
    </div>
  );
};

export default Canvas;