import React, { FunctionComponent, createContext, useRef, useContext, useCallback } from 'react';

const CanvasContainerContext = createContext<React.MutableRefObject<HTMLDivElement>>(null);

export const CanvasContainerContextProvider: FunctionComponent = ({ children }) => {
  const containerRef = useRef<HTMLDivElement>();

  return (
    <CanvasContainerContext.Provider value={containerRef}>
      {children}
    </CanvasContainerContext.Provider>
  );
}

export const CanvasContainer: FunctionComponent<{ className?: string; }> = ({ className, children }) => {
  const containerRef = useContext(CanvasContainerContext);
  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
};

export function useContainerRect() {
  const containerRef = useContext(CanvasContainerContext);
  return useCallback(() => {
    const { left, top, width, height } = containerRef.current.getBoundingClientRect();
    return { left, top, width, height };
  }, [containerRef.current]);
}
