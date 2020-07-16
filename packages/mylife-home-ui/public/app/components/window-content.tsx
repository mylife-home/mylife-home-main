import React, { FunctionComponent } from 'react';
import { VWindow } from '../store/types/model';
import Control from './control';

type WindowContentProps = {
  window: VWindow;
};

function getStyleSize(window: VWindow) {
  const { height, width } = window;
  return { height, width };
}

const WindowContent: FunctionComponent<WindowContentProps> = ({ window }) => (
  <div style={getStyleSize(window)} className="mylife-window-container">
    <img src={window.backgroundResource && `/resources/${window.backgroundResource}`} />
    {window.controls.map((control) => (
      <Control
        key={control.id}
        windowId={window.id}
        controlId={control.id}
        control={control}
      />
    ))}
  </div>
);

export default WindowContent;
