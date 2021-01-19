import React, { FunctionComponent } from 'react';

import { useWindowState } from '../window-state';
import CanvasItem from './item';
import { CanvasWindowView } from './view';

const CanvasWindow: FunctionComponent = () => {
  const { window, update, selected, select } = useWindowState();

  return (
    <CanvasItem size={{ width: window.width, height: window.height }} onResize={(size) => update(size)} selected={selected} onSelect={select}>
      <CanvasWindowView />
    </CanvasItem>
  );
};

export default CanvasWindow;
