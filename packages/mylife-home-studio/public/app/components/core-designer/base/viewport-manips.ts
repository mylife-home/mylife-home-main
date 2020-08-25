import { useCallback } from 'react';
import Konva from 'konva';

import { useViewInfo } from './view-info';
import { LAYER_SIZE } from './defs';

const SCALE_BY = 1.1;

export function useSetViewportLayerPosition() {
  const { viewInfo, setViewport } = useViewInfo();
  return useCallback((layerPosition: Konva.Vector2d) => {
    const { viewport } = viewInfo;

    const newPos = {
      x: lockPosBetween(layerPosition.x - viewport.width / 2, LAYER_SIZE - viewport.width),
      y: lockPosBetween(layerPosition.y - viewport.height / 2, LAYER_SIZE - viewport.height),
    };

    setViewport(newPos);

  }, [viewInfo, setViewport]); // TODO: do not rebuilt on viewInfo change
}

export function useSetViewportContainerPosition() {
  const { viewInfo, setViewport } = useViewInfo();
  return useCallback((containerPosition: Konva.Vector2d) => {
    const { scale } = viewInfo.viewport;
    setViewport({ x: containerPosition.x / scale, y: containerPosition.y / scale });
  }, [viewInfo, setViewport]); // TODO: do not rebuilt on viewInfo change
}

export function useZoom() {
  const { viewInfo, setViewport } = useViewInfo();

  const zoom = Math.round(viewInfo.viewport.scale * 100);

  const setScale = (scale: number, origin?: Konva.Vector2d) => {
    // origin defaults to container center
    origin = origin || {
      x: viewInfo.container.width / 2,
      y: viewInfo.container.height / 2,
    };

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

    const newPos = {
      x: layerOrigin.x - origin.x / newScale,
      y: layerOrigin.y - origin.y / newScale,
    };

    const newProps = {
      x: lockPosBetween(newPos.x, LAYER_SIZE - viewport.width),
      y: lockPosBetween(newPos.y, LAYER_SIZE - viewport.height),
      scale: newScale
    };

    setViewport(newProps);
  };

  const slideZoom = useCallback((value: number) => setScale(value / 100), [setScale]);

  const wheelZoom = useCallback((pointer: Konva.Vector2d, delta: number) => {
    const oldScale = viewInfo.viewport.scale;
    const newScale = delta > 0 ? oldScale / SCALE_BY : oldScale * SCALE_BY;
    setScale(newScale, pointer);
  }, [setScale, viewInfo]); // TODO: do not rebuild callback on every viewInfo change

  return { zoom, wheelZoom, slideZoom };
}

function lockPosBetween(value: number, max: number) {
  if (value < 0) {
    return 0;
  }

  if (value > max) {
    return max;
  }
  
  return value;
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
