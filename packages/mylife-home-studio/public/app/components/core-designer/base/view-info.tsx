import React, { FunctionComponent, createContext, useState, useMemo, useContext } from 'react';

export interface ViewInfo {
  x: number;
  y: number;
  height: number;
  width: number;
  scale: number;
}

export type ViewInfoSetter = (updater: (viewInfo: ViewInfo) => ViewInfo) => void;

interface ViewInfoContextProps {
  viewInfo: ViewInfo;
  setViewInfo: ViewInfoSetter;
}

const ViewInfoContext = createContext<ViewInfoContextProps>(null);

export function useViewInfo(): [ViewInfo, ViewInfoSetter] {
  const { viewInfo, setViewInfo } = useContext(ViewInfoContext);
  return [viewInfo, setViewInfo];
}

const DEFAULT: ViewInfo = {
  x: 0,
  y: 0,
  height: 0,
  width: 0,
  scale: 1
};

export const ViewInfoProvider: FunctionComponent = ({ children }) => {
  const [viewInfo, setViewInfo] = useState(DEFAULT);
  const contextProps = useMemo(() => ({ viewInfo, setViewInfo }), [viewInfo, setViewInfo]);

  return (
    <ViewInfoContext.Provider value={contextProps}>
      {children}
    </ViewInfoContext.Provider>
  );
};