import React, { FunctionComponent, forwardRef, useMemo } from 'react';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';

import { Position, Size, ResizeDirection, useMoveable, useResizable } from './dnd';

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

  const onResizerResize = (direction: ResizeDirection, delta: Position) => {
    const newSize = { ... size };
    switch (direction) {
      case 'right':
        newSize.width = Math.max(0, newSize.width + delta.x);
        break;

      case 'bottom':
        newSize.height = Math.max(0, newSize.height + delta.y);
        break;

      case 'bottomRight':
        newSize.width = Math.max(0, newSize.width + delta.x);
        newSize.height = Math.max(0, newSize.height + delta.y);
        break;
    }

    onResize(newSize);
  };

  const right = useResizable(id, 'right', delta => onResizerResize('right', delta));
  const bottom = useResizable(id, 'bottom', delta => onResizerResize('bottom', delta));
  const bottomRight = useResizable(id, 'bottomRight', delta => onResizerResize('bottomRight', delta));

  const localSize = useMemo(() => {
    if (right.delta) {
      const localSize = { ...size };
      localSize.width += right.delta.x;
      return localSize;
    }

    if (bottom.delta) {
      const localSize = { ...size };
      localSize.height += bottom.delta.y;
      return localSize;
    }

    if (bottomRight.delta) {
      const localSize = { ...size };
      localSize.width += bottomRight.delta.x;
      localSize.height += bottomRight.delta.y;
      return localSize;
    }

    return size;
  }, [size, right.delta, bottom.delta, bottomRight.delta]);

  return (
    <div {...props} className={clsx(className, classes.resizable)} style={{ width: localSize.width, height: localSize.height }}>
      {children}
      <Resizer ref={right.ref} direction='right'/>
      <Resizer ref={bottom.ref} direction='bottom'/>
      <Resizer ref={bottomRight.ref} direction='bottomRight'/>
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

    backgroundColor: 'blue',
  },
  right: {
    width: RESIZER_WIDTH * 2,
    right: -RESIZER_WIDTH,

    top: 0,
    bottom: RESIZER_WIDTH,

    cursor: 'col-resize',

    backgroundColor: 'red',
  },
  bottomRight: {
    height: RESIZER_WIDTH * 2,
    width: RESIZER_WIDTH * 2,

    right: -RESIZER_WIDTH,
    bottom: -RESIZER_WIDTH,

    cursor: 'se-resize',

    backgroundColor: 'pink',
  },
}));

const Resizer = forwardRef<HTMLDivElement, ResizerProps>(({ direction }, ref) => {
  const classes = useResizerStyles();
  return <div ref={ref} className={clsx(classes.common, classes[direction])} />
});