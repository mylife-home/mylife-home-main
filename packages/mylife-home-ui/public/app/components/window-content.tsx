import React, { FunctionComponent } from 'react';
import { VWindow } from '../store/types/windows';
import Control from './control';

type WindowContentProps = {
  window: VWindow;
  onActionPrimary: (window: string, control: string) => void;
  onActionSecondary: (window: string, control: string) => void;
};

function getStyleSize(window: VWindow) {
  const { height, width } = window;
  return { height, width };
}

const WindowContent: FunctionComponent<WindowContentProps> = ({ window, onActionPrimary, onActionSecondary }) => (
  <div style={getStyleSize(window)} className="mylife-window-container">
    <img src={window.resource && `/resources/${window.resource}`} />
    {window.controls.map((control) => (
      <Control
        key={control.id}
        control={control}
        onActionPrimary={() => onActionPrimary(window.id, control.id)}
        onActionSecondary={() => onActionSecondary(window.id, control.id)}
      />
    ))}
  </div>
);

export default WindowContent;
