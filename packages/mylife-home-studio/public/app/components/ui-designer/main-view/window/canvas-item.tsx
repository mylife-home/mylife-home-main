import React, { CSSProperties, FunctionComponent } from 'react';
import { Resizable, ResizeCallback } from 're-resizable';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';

import { useMoveable, Position } from './canvas-dnd';

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

const RESIZING = { 
  bottom: true,
  bottomLeft: false,
  bottomRight: true,
  left: false,
  right: true,
  top: false,
  topLeft: false,
  topRight: false
};

const useStyles = makeStyles((theme) => ({
  moveable: {
    position: 'absolute',
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

  const onResizeStop: ResizeCallback = (e, direction, ref) => {
    const width = parseInt(ref.style.width);
    const height = parseInt(ref.style.height);
    onResize({ width, height });
  };

  const content = (
    <Resizable size={size} onResizeStop={onResizeStop} enable={RESIZING}>
      <div className={clsx(classes.wrapper, selected && classes.selected)}>
        {children}
      </div>
    </Resizable>
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
  const left = position.x;
  const top = position.y;
  const { ref, isMoving } = useMoveable(position, onMove);

  if (isMoving) {
    return <div ref={ref} />
  }

  return <div {...props} className={clsx(className, classes.moveable)} ref={ref} style={{ left: position.x, top: position.y }} />;
};

