import React, { FunctionComponent } from 'react';
import { Rnd } from 'react-rnd';
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

  return (
    <Rnd
      className={className}
      onMouseDown={(e) => { e.stopPropagation(); onSelect(); }}

      enableResizing={RESIZING}
      size={size}
      onResizeStop={(e, direction, ref) => { onResize({ width: parseInt(ref.style.width), height: parseInt(ref.style.height) }); }}

      disableDragging={!position}
      position={position}
      onDragStop={(e, d) => { onMove({ x: d.x, y: d.y }); }}
    >
      <div className={clsx(classes.wrapper, selected && classes.selected)}>
        {children}
      </div>
    </Rnd>
  );
};

export default CanvasItem;
