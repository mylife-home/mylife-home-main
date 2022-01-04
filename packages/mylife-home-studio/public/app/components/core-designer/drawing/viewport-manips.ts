import { useCallback } from 'react';
import { useViewInfo, ViewInfo } from './view-info';
import { Point, Rectangle } from './types';
import { Konva } from './konva';

const SCALE_BY = 1.1;

export function usePosition() {
  const { updateViewport } = useViewInfo();

  const setLayerPosition = useCallback((layerPosition: Point) => updateViewport(viewInfo => {
    const { viewport } = viewInfo;

    return {
      x: layerPosition.x - viewport.width / 2,
      y: layerPosition.y - viewport.height / 2
    };

  }), [updateViewport]);

  const setContainerPosition = useCallback((containerPosition: Point) => updateViewport(viewInfo => {
    const { scale } = viewInfo.viewport;
    return { x: containerPosition.x / scale, y: containerPosition.y / scale };
  }), [updateViewport]);

  return { setLayerPosition, setContainerPosition };
}

export function useZoom() {
  const { viewInfo, updateViewport } = useViewInfo();

  const zoom = Math.round(viewInfo.viewport.scale * 100);

  const updateScale = useCallback((callback: (viewInfo: ViewInfo) => { scale: number, origin: Point }) => updateViewport(viewInfo => {
    const { scale, origin } = callback(viewInfo);
    const { viewport } = viewInfo;

    const oldScale = viewport.scale;
    const newScale = lockScale(scale);

    if (oldScale === newScale) {
      return;
    }

    const layerOrigin = {
      x: viewport.x + origin.x / oldScale,
      y: viewport.y + origin.y / oldScale,
    };

    return {
      x: layerOrigin.x - origin.x / newScale,
      y: layerOrigin.y - origin.y / newScale,
      scale: newScale
    };

  }), [updateViewport]);

  const slideZoom = useCallback((value: number) => updateScale(viewInfo => ({ 
    scale: value / 100,
    origin: {
      x: viewInfo.container.width / 2,
      y: viewInfo.container.height / 2,
    }
  })), [updateScale]);

  const wheelZoom = useCallback((pointer: Point, delta: number) => updateScale(viewInfo => { 
    const oldScale = viewInfo.viewport.scale;
    const scale = delta > 0 ? oldScale / SCALE_BY : oldScale * SCALE_BY;
    return { scale, origin: pointer };
  }), [updateScale, viewInfo]);

  return { zoom, wheelZoom, slideZoom };
}

function lockScale(value: number) {
  if(value < 0.1) {
    return 0.1;
  }

  if(value > 1) {
    return 1;
  }

  return value;
}

export function useCursorPositionConverter(stage: Konva.Stage) {
  const { viewInfo } = useViewInfo();
  const { viewport } = viewInfo;
  const rect = stage ? stage.container().getBoundingClientRect() : { x: 0, y: 0 };

  return useCallback((pointer: Point) => {

    const result: Point = {
      x: (pointer.x - rect.x) / viewport.scale + viewport.x,
      y: (pointer.y - rect.y) / viewport.scale + viewport.y,
    };

    return result;
  }, [viewport.x, viewport.y, viewport.scale, rect.x, rect.y]);
}

export function useViewPortVisibility() {
  const { viewInfo } = useViewInfo();
  const { viewport } = viewInfo;

  const isPointVisible = useCallback((point: Point) => {
    return point.x >= viewport.x && point.x <= viewport.x + viewport.width
      && point.y >= viewport.y && point.y <= viewport.y + viewport.height;
  }, [viewport.x, viewport.y, viewport.width, viewport.height]);

  const isRectVisible = useCallback((rect: Rectangle) => {
    return rect.x + rect.width >= viewport.x && rect.x <= viewport.x + viewport.width
      && rect.y + rect.height >= viewport.y && rect.y <= viewport.y + viewport.height;
  }, [viewport.x, viewport.y, viewport.width, viewport.height]);

  const isLineVisible = useCallback((p1: Point, p2: Point) => {
    if (isPointVisible(p1) || isPointVisible(p2)) {
      return true;
    }

    const line: Line = { p1, p2 };

    const topLeft: Point = { x: viewport.x, y: viewport.y };
    const topRight: Point = { x: viewport.x + viewport.width, y: viewport.y };
    const bottomLeft: Point = { x: viewport.x, y: viewport.y + viewport.height };
    const bottomRight: Point = { x: viewport.x + viewport.width, y: viewport.y + viewport.height };

    return (intersect(line, { p1: topLeft, p2: topRight })
      || intersect(line, { p1: topRight, p2: bottomRight })
      || intersect(line, { p1: bottomRight, p2: bottomLeft })
      || intersect(line, { p1: bottomLeft, p2: topLeft }));

  }, [viewport.x, viewport.y, viewport.width, viewport.height]);

  return { isPointVisible, isRectVisible, isLineVisible };
}

interface Line {
  p1: Point;
  p2: Point;
}

type Direction = 'colinear' | 'anti-clockwise' | 'clockwise';

// https://www.tutorialspoint.com/Check-if-two-line-segments-intersect

function direction(a: Point, b: Point, c: Point): Direction {
  const val = (b.y - a.y) * (c.x - b.x) - (b.x - a.x) * (c.y - b.y);
  if (val == 0) {
    return 'colinear';
  } else if (val < 0) {
    return 'anti-clockwise';
  } else {
    return 'clockwise';
  }
}

function intersect(l1: Line, l2: Line) {
  //four direction for two lines and points of other line
  const dir1 = direction(l1.p1, l1.p2, l2.p1);
  const dir2 = direction(l1.p1, l1.p2, l2.p2);
  const dir3 = direction(l2.p1, l2.p2, l1.p1);
  const dir4 = direction(l2.p1, l2.p2, l1.p2);

  return dir1 != dir2 && dir3 != dir4;
}