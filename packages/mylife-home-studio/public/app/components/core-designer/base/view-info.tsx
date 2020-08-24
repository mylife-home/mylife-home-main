import React, { FunctionComponent, createContext, useState, useMemo, useContext, useCallback } from 'react';
import { LAYER_SIZE } from './defs';

interface Viewport {
  x: number;
  y: number;
  width: number;
  height: number;
  scale: number;
}

interface Size {
  width: number;
  height: number;
}

export interface ViewInfo {
  viewport: Viewport;
  container: Size
}

interface ViewInfoContextProps {
  viewInfo: ViewInfo;
  setViewport: (data: { x?: number; y?: number; scale?: number; }) => void;
  setViewContainer: (container: Size) => void;
}

export const ViewInfoContext = createContext<ViewInfoContextProps>(null);

export function useViewInfo() {
  return useContext(ViewInfoContext);
}

const DEFAULT: ViewInfo = {
  viewport: {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    scale: 1
  },
  container: {
    width: 0,
    height: 0,
  }
};

export const ViewInfoProvider: FunctionComponent = ({ children }) => {
  const [viewInfo, setViewInfo] = useState(DEFAULT);

  const setViewport = useCallback((data: { x?: number; y?: number; scale?: number; }) => setViewInfo(viewInfo => {
    const { container } = viewInfo;
    const viewport = { ... viewInfo.viewport, ...deleteNullProps(data) };
    lockViewport(viewport);

    return { container, viewport };
  }), [setViewInfo]);

  const setViewContainer = useCallback((container: Size) => setViewInfo(viewInfo => {
    const viewport = { ... viewInfo.viewport };
    viewport.width = container.width * viewport.scale;
    viewport.height = container.height * viewport.scale;
    lockViewport(viewport);

    return { container, viewport };
  }), [setViewInfo]);

  const contextProps = useMemo(() => ({ viewInfo, setViewport, setViewContainer }), [viewInfo, setViewport, setViewContainer]);

  return (
    <ViewInfoContext.Provider value={contextProps}>
      {children}
    </ViewInfoContext.Provider>
  );
};

function lockViewport(viewport: Viewport) {
  if (viewport.x + viewport.width > LAYER_SIZE) {
    viewport.x = LAYER_SIZE - viewport.width;
  }

  if (viewport.y + viewport.height > LAYER_SIZE) {
    viewport.y = LAYER_SIZE - viewport.height;
  }

  // do this after, in case width/height > LAYER_SIZE
  if (viewport.x < 0) {
    viewport.x = 0;
  }

  if (viewport.y < 0) {
    viewport.y = 0;
  }
}

function deleteNullProps<T extends {}>(obj: T): T {
  const ret: any = {};
  for(const [key, value] of Object.entries(obj)) {
    if(value != null) {
      ret[key] = value;
    }
  }
  return ret;
}