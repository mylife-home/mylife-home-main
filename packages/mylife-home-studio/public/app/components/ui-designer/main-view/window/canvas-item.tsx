import React, { FunctionComponent } from 'react';
import { Rnd, RndDragCallback, RndResizeCallback } from 'react-rnd';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';

export interface Size {
  width: number;
  height: number;
}

export interface Position {
  x: number;
  y: number;
}

export interface RndBoxProps {
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

const CanvasItem: FunctionComponent<RndBoxProps> = ({ children, className, size, onResize, position, onMove, selected, onSelect }) => {
  const classes = useStyles();

  const onDragStop: RndDragCallback = (e, data) => {
    if (data.x !== position.x || data.y !== position.y) {
      onMove({ x: data.x, y: data.y });
    }
  };

  const onResizeStop: RndResizeCallback = (e, direction, ref) => {
    const width = parseInt(ref.style.width);
    const height = parseInt(ref.style.height);
    onResize({ width, height });
  };

  return (
    <Rnd
      className={className}
      onMouseDown={(e) => { e.stopPropagation(); onSelect(); }}

      enableResizing={RESIZING}
      size={size}
      onResizeStop={onResizeStop}

      disableDragging={!position}
      position={position}
      onDragStop={onDragStop}
    >
      <div className={clsx(classes.wrapper, selected && classes.selected)}>
        {children}
      </div>
    </Rnd>
  );
};

export default CanvasItem;
