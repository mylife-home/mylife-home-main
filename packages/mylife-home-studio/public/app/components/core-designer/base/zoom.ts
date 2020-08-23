import { useCallback } from 'react';
import Konva from 'konva';

import { useViewInfo } from './view-info';
import { useCanvasTheme } from './theme';

const SCALE_BY = 1.1;

export function useZoom() {
  const theme = useCanvasTheme();
  const [viewInfo, setViewInfo] = useViewInfo();

  const zoom = Math.round(viewInfo.scale * 100);

  // TODO: zoom from view center
  const slideZoom = useCallback((value: number) => setViewInfo((viewInfo) => ({ ...viewInfo, scale: value / 100 })), [setViewInfo]);

  const wheelZoom = useCallback((pointer: Konva.Vector2d, delta: number) => setViewInfo(viewInfo => {
    const oldScale = viewInfo.scale;
    const mousePointTo = {
      x: (pointer.x - viewInfo.x) / oldScale,
      y: (pointer.y - viewInfo.y) / oldScale,
    };
  
    const newScale = lockScale(delta > 0 ? oldScale / SCALE_BY : oldScale * SCALE_BY);
    const newProps = {
      x: lockPosBetween(pointer.x - mousePointTo.x * newScale, theme.layerSize - viewInfo.width),
      y: lockPosBetween(pointer.y - mousePointTo.y * newScale, theme.layerSize - viewInfo.height),
      scale: newScale
    };

    return { ...viewInfo, ...newProps };
  }), [theme, setViewInfo]);

  return { zoom, wheelZoom, slideZoom };
}

function lockPosBetween(value: number, max: number) {
  if (value > 0) {
    return 0;
  }

  if (value <= -max) {
    return -max + 1;
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
