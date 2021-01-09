import React, { FunctionComponent, forwardRef, useMemo } from 'react';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';

import { useMoveable, Position, useResizable } from './canvas-dnd';

export interface Size {
  width: number;
  height: number;
}

export interface CanvasItemProps {
  className?: string;
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
  wrapper: {
    height: '100%',
    width: '100%',
    border: `1px solid ${theme.palette.divider}`,
    position: 'relative',
  },
  selected: {
    border: `1px solid ${theme.palette.primary.main}`,
  },
}));

const CanvasItem: FunctionComponent<CanvasItemProps> = ({ className, children, size, onResize, position, onMove, selected, onSelect }) => {
  const classes = useStyles();

  const onClick = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    onSelect();
  };

  const content = (
    <ResizableItem size={size} onResize={onResize}>
      <div className={clsx(classes.wrapper, selected && classes.selected)}>
        {children}
      </div>
    </ResizableItem>
  );

  if(position) {
    return (
      <MoveableItem className={className} onClick={onClick} position={position} onMove={onMove}>
        {content}
      </MoveableItem>
    );
  } else {
    return (
      <div className={className} onClick={onClick}>
        {content}
      </div>
    );
  }
};

export default CanvasItem;

interface MoveableItemProps extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  position: Position;
  onMove: (position: Position) => void;
}

const MoveableItem: FunctionComponent<MoveableItemProps> = ({ position, onMove, className, ...props }) => {
  const classes = useStyles();
  const { ref, isMoving } = useMoveable(position, onMove);

  if (isMoving) {
    return <div ref={ref} />
  }

  return <div {...props} className={clsx(className, classes.moveable)} ref={ref} style={{ left: position.x, top: position.y }} />;
};

interface ResizableItemProps extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  size: Size;
  onResize: (size: Size) => void;
}

const ResizableItem: FunctionComponent<ResizableItemProps> = ({ size, onResize, className, children, ...props }) => {
  const classes = useStyles();

  const onResizerResize = (orientation: ResizerOrientation, delta: Position) => {
    const newSize = { ... size };
    switch (orientation) {
      case 'right':
        newSize.width += delta.x;
        break;

      case 'bottom':
        newSize.height += delta.y;
        break;

      case 'bottomRight':
        newSize.width += delta.x;
        newSize.height += delta.y;
        break;
    }

    onResize(newSize);
  };

  const right = useResizable(delta => onResizerResize('right', delta));
  const bottom = useResizable(delta => onResizerResize('bottom', delta));
  const bottomRight = useResizable(delta => onResizerResize('bottomRight', delta));

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
      <Resizer ref={right.ref} orientation='right'/>
      <Resizer ref={bottom.ref} orientation='bottom'/>
      <Resizer ref={bottomRight.ref} orientation='bottomRight'/>
    </div>
  );
};

type ResizerOrientation = 'right' | 'bottom' | 'bottomRight';

interface ResizerProps {
  orientation: ResizerOrientation;
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

const Resizer = forwardRef<HTMLDivElement, ResizerProps>(({ orientation }, ref) => {
  const classes = useResizerStyles();
  return <div ref={ref} className={clsx(classes.common, classes[orientation])} />
});