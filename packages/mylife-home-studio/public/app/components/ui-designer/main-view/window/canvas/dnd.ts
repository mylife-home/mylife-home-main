import { useEffect, useCallback } from 'react';
import { useDrop, useDrag, useDragLayer, ConnectDragPreview, XYCoord } from 'react-dnd';
import { Identifier } from 'dnd-core';
import { getEmptyImage } from 'react-dnd-html5-backend';

import { useSnapValue } from '../snap';
import { useContainerRect } from './container';
import { Position, ResizeDirection, Size } from './types';
import { createNewControl } from '../../common/templates';

export const ItemTypes = {
  CREATE: Symbol('dnd-canvas-create'),
  MOVE: Symbol('dnd-canvas-move'),
  RESIZE: Symbol('dnd-canvas-resize'),
};

const SUPPORTED_ITEM_TYPES = new Set([ItemTypes.CREATE, ItemTypes.MOVE, ItemTypes.RESIZE]);

interface DragItem {
  type: symbol;
}

interface CreateDragItem extends DragItem {
  type: typeof ItemTypes.CREATE;
  // no additional data
}

interface MoveDragItem extends DragItem {
  type: typeof ItemTypes.MOVE;
  id: string; // control id being moved
  position: Position;
}

interface ResizeDragItem extends DragItem {
  type: typeof ItemTypes.RESIZE;
  id: string; // control id being resized, or null for window
  direction: ResizeDirection;
  size: Size;
}

// collect props of drag layer, drop result, then argument to drag end callbacks
export interface ComponentData {
  type: symbol;
}

export interface CreateComponentData extends ComponentData {
  type: typeof ItemTypes.CREATE;
  newPosition: Position;
  newSize: Size;
}

export interface MoveComponentData extends ComponentData {
  type: typeof ItemTypes.MOVE;
  id: string; // control id being moved
  newPosition: Position;
}

export interface ResizeComponentData extends ComponentData {
  type: typeof ItemTypes.RESIZE;
  id: string; // control id being resized, or null for window
  newSize: Size;
}

export function useDroppable() {
  const computeComponentData = useComputeComponentData();

  const [, ref] = useDrop({
    accept: [ItemTypes.CREATE, ItemTypes.MOVE, ItemTypes.RESIZE],
    drop: computeComponentData,
  });

  return ref;
}

export function useCreatable(onCreate: (position: Position) => void) {
  const [, ref, preview] = useDrag({
    item: { type: ItemTypes.CREATE },
    end(item: CreateDragItem, monitor) {
      if (!monitor.didDrop()) {
        return;
      }

      const result = monitor.getDropResult() as CreateComponentData;
      onCreate(result.newPosition);
    }
  });

  useHidePreview(preview);

  return ref;
}

export function useMoveable(id: string, position: Position, onMove: (newPosition: Position) => void) {
  const [{ isDragging }, ref, preview] = useDrag({
    item: { type: ItemTypes.MOVE, id, position },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    end(item: MoveDragItem, monitor) {
      if (!monitor.didDrop()) {
        return;
      }

      const result = monitor.getDropResult() as MoveComponentData;
      onMove(result.newPosition);
    }
  });

  useHidePreview(preview);

  return { ref, isMoving: isDragging };
}

export function useResizable(id: string, direction: ResizeDirection, size: Size, onResize: (newSize: Size) => void) {
  const [{ isDragging }, resizerRef, preview] = useDrag({
    item: { type: ItemTypes.RESIZE, id, direction, size },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    end(item: ResizeDragItem, monitor) {
      if (!monitor.didDrop()) {
        return;
      }

      const result = monitor.getDropResult() as ResizeComponentData;
      onResize(result.newSize);
    }
  });

  useHidePreview(preview);

  return { resizerRef, isResizing: isDragging };
}

export function useCanvasDragLayer() {
  const computeComponentData = useComputeComponentData();
  return useDragLayer((monitor) => {
    const isDragging = monitor.isDragging() && SUPPORTED_ITEM_TYPES.has(monitor.getItemType() as symbol);
    return isDragging ? computeComponentData(monitor.getItem(), monitor) : null;
  });
}

function useHidePreview(preview: ConnectDragPreview) {
  useEffect(() => {
    preview(getEmptyImage(), { captureDraggingState: true });
  }, [preview]);
}

function useComputeComponentData() {
  const getContainerRect = useContainerRect();
  const snapValue = useSnapValue();

  return useCallback((item: DragItem, monitor: CommonMonitor) => {
    const api = new ComputeApi(getContainerRect, snapValue);
    return computeComponentData(item, monitor, api);
  }, [getContainerRect, snapValue]);
}

function computeComponentData(item: DragItem, monitor: CommonMonitor, api: ComputeApi): ComponentData {
  if (!item) {
    return null;
  }

  switch (item.type) {
    case ItemTypes.CREATE:
      return computeCreateComponentData(item as CreateDragItem, monitor, api);

    case ItemTypes.MOVE:
      return computeMoveComponentData(item as MoveDragItem, monitor, api);

    case ItemTypes.RESIZE: {
      return computeResizeComponentData(item as ResizeDragItem, monitor, api);
    }
  }
}

function computeCreateComponentData(item: CreateDragItem, monitor: CommonMonitor, api: ComputeApi): CreateComponentData {
  const cursorOffset = monitor.getClientOffset();
  if (!cursorOffset) {
    return null;
  }

  const position = api.clientOffsetToPosition(cursorOffset);
  const newSize = api.snapSize(api.newControlSize);

  // the cursor is on the center of the control
  const newPosition = api.snapPosition({
    x: position.x - newSize.width / 2,
    y: position.y - newSize.height / 2
  });

  return {
    type: item.type,
    newPosition,
    newSize,
  };
}

function computeMoveComponentData(item: MoveDragItem, monitor: CommonMonitor, api: ComputeApi): MoveComponentData {
  const delta = monitor.getDifferenceFromInitialOffset();
  if (!delta) {
    return null;
  }

  const newPosition = api.snapPosition({
    x: item.position.x + delta.x,
    y: item.position.y + delta.y,
  });

  return {
    type: item.type,
    id: item.id,
    newPosition,
  };
}

function computeResizeComponentData(item: ResizeDragItem, monitor: CommonMonitor, api: ComputeApi): ResizeComponentData {
  const delta = monitor.getDifferenceFromInitialOffset();
  if (!delta) {
    return null;
  }

  const newSize = { ...item.size };

  switch (item.direction) {
    case 'right':
      newSize.width = api.snap(Math.max(0, newSize.width + delta.x));
      break;

    case 'bottom':
      newSize.height = api.snap(Math.max(0, newSize.height + delta.y));
      break;

    case 'bottomRight':
      newSize.width = api.snap(Math.max(0, newSize.width + delta.x));
      newSize.height = api.snap(Math.max(0, newSize.height + delta.y));
      break;
  }

  return {
    type: item.type,
    id: item.id,
    newSize,
  };
}

// container rect lifecycle: create on each compute
class ComputeApi {
  private _containerRect: { left: number; top: number; width: number; height: number; };
  private static _newControlSize: Size;

  constructor(private readonly _getContainerRect: () => { left: number; top: number; width: number; height: number; }, readonly snapValue: number) {
  }

  get containerRect() {
    if (!this._containerRect) {
      this._containerRect = this._getContainerRect();
    }

    return this._containerRect;
  }

  get newControlSize() {
    if (!ComputeApi._newControlSize) {
      const { width, height } = createNewControl();
      ComputeApi._newControlSize = { width, height };
    }
    return ComputeApi._newControlSize;
  }

  clientOffsetToPosition(offset: XYCoord) {
    const { left, top } = this.containerRect;

    const position: Position = {
      x: Math.round(offset.x - left),
      y: Math.round(offset.y - top),
    };

    return position;
  };

  positionToClientOffset(position: Position) {
    const { left, top } = this.containerRect;

    const offset: XYCoord = {
      x: position.x + left,
      y: position.y + top,
    };

    return offset;
  };

  snapPosition(position: Position): Position {
    return {
      x: this.snap(position.x),
      y: this.snap(position.y),
    };
  }

  snapSize(size: Size): Size {
    return {
      width: this.snap(size.width),
      height: this.snap(size.height),
    };
  }

  snap(value: number) {
    return Math.round(value / this.snapValue) * this.snapValue;
  }
}

// common props between DropTargetMonitor and DragLayerMonitor
interface CommonMonitor {
  /**
   * Returns a string or an ES6 symbol identifying the type of the current dragged item.
   * Returns null if no item is being dragged.
   */
  getItemType(): Identifier | null;
  /**
   * Returns a plain object representing the currently dragged item.
   * Every drag source must specify it by returning an object from its beginDrag() method.
   * Returns null if no item is being dragged.
   */
  getItem(): any;
  /**
   * Returns the { x, y } client offset of the pointer at the time when the current drag operation has started.
   * Returns null if no item is being dragged.
   */
  getInitialClientOffset(): XYCoord | null;
  /**
   * Returns the { x, y } client offset of the drag source component's root DOM node at the time when the current
   * drag operation has started. Returns null if no item is being dragged.
   */
  getInitialSourceClientOffset(): XYCoord | null;
  /**
   * Returns the last recorded { x, y } client offset of the pointer while a drag operation is in progress.
   * Returns null if no item is being dragged.
   */
  getClientOffset(): XYCoord | null;
  /**
   * Returns the { x, y } difference between the last recorded client offset of the pointer and the client
   * offset when current the drag operation has started. Returns null if no item is being dragged.
   */
  getDifferenceFromInitialOffset(): XYCoord | null;
  /**
   * Returns the projected { x, y } client offset of the drag source component's root DOM node, based on its
   * position at the time when the current drag operation has started, and the movement difference.
   * Returns null if no item is being dragged.
   */
  getSourceClientOffset(): XYCoord | null;
}
