import React, { FunctionComponent } from 'react';
import { Rnd } from 'react-rnd';

export interface Size {
  width: number;
  height: number;
}

export interface Position {
  x: number;
  y: number;
}

export interface RndBoxProps {
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

const RndBox: FunctionComponent<RndBoxProps> = ({ children, size, onResize, position, onMove }) => (
  <Rnd
    enableResizing={RESIZING}
    size={size}
    onResizeStop={(e, direction, ref) => { onResize({ width: parseInt(ref.style.width), height: parseInt(ref.style.height) }); }}

    disableDragging={!position}
    position={position}
    onDragStop={(e, d) => { onMove({ x: d.x, y: d.y }); }}
  >
    {children}
  </Rnd>
);

export default RndBox;
