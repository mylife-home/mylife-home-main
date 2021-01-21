import React, { FunctionComponent, forwardRef } from 'react';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';

import { useMoveable, useResizable } from './dnd';
import { Position, Size, ResizeDirection } from './types';

export interface CanvasItemProps {
  className?: string;
  id?: string;

  selected: boolean;
  onSelect: () => void;

  size: Size;
  onResize: (size: Size) => void;
  // no position => not movable
  position?: Position;
  onMove?: (position: Position) => void;
}

const useStyles = makeStyles((theme) => ({
  moveable: {
    position: 'absolute',
  },
  resizable: {
    position: 'relative',
  },
}));

const CanvasItem: FunctionComponent<CanvasItemProps> = ({ className, children, id = null, size, onResize, position, onMove, selected, onSelect }) => {
  const onMouseDown = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    onSelect();
  };

  const content = (
    <ResizableItem id={id} size={size} onResize={onResize}>
      {children}
    </ResizableItem>
  );

  if(position) {
    return (
      <MoveableItem className={className} id={id} onMouseDown={onMouseDown} position={position} onMove={onMove}>
        {content}
      </MoveableItem>
    );
  } else {
    return (
      <div className={className} onMouseDown={onMouseDown}>
        {content}
      </div>
    );
  }
};

export default CanvasItem;

interface MoveableItemProps extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  id: string;
  position: Position;
  onMove: (position: Position) => void;
}

const MoveableItem: FunctionComponent<MoveableItemProps> = ({ id, position, onMove, className, ...props }) => {
  const classes = useStyles();
  const { ref, isMoving } = useMoveable(id, position, onMove);
  return <div {...props} className={clsx(className, classes.moveable)} ref={ref} style={{ left: position.x, top: position.y, opacity: isMoving ? 0 : 1 }} />;
};

interface ResizableItemProps extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  id: string;
  size: Size;
  onResize: (size: Size) => void;
}

const ResizableItem: FunctionComponent<ResizableItemProps> = ({ id, size, onResize, className, children, ...props }) => {
  const classes = useStyles();
  const right = useResizable(id, 'right', size, onResize);
  const bottom = useResizable(id, 'bottom', size, onResize);
  const bottomRight = useResizable(id, 'bottomRight', size, onResize);

  const isResizing = right.isResizing || bottom.isResizing || bottomRight.isResizing;

  return (
    <div {...props} className={clsx(className, classes.resizable)} style={{ width: size.width, height: size.height, opacity: isResizing ? 0 : 1 }}>
      {children}
      <Resizer ref={right.resizerRef} direction='right'/>
      <Resizer ref={bottom.resizerRef} direction='bottom'/>
      <Resizer ref={bottomRight.resizerRef} direction='bottomRight'/>
    </div>
  );
};

interface ResizerProps {
  direction: ResizeDirection;
}

const RESIZER_WIDTH = 5; // on each side

const useResizerStyles = makeStyles((theme) => ({
  common: {
    position: 'absolute',
    userSelect: 'none',
  },
  bottom: {
    height: RESIZER_WIDTH * 2,
    bottom: -RESIZER_WIDTH,

    left: 0,
    right: RESIZER_WIDTH,

    cursor: 'row-resize',
  },
  right: {
    width: RESIZER_WIDTH * 2,
    right: -RESIZER_WIDTH,

    top: 0,
    bottom: RESIZER_WIDTH,

    cursor: 'col-resize',
  },
  bottomRight: {
    height: RESIZER_WIDTH * 2,
    width: RESIZER_WIDTH * 2,

    right: -RESIZER_WIDTH,
    bottom: -RESIZER_WIDTH,

    cursor: 'se-resize',
  },
}));

const Resizer = forwardRef<HTMLDivElement, ResizerProps>(({ direction }, ref) => {
  const classes = useResizerStyles();
  return <div ref={ref} className={clsx(classes.common, classes[direction])} />
});