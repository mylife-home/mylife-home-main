import { useCallback } from 'react';
import { useViewInfo, ViewInfo } from './view-info';
import { Point } from './types';

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
