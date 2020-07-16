import React, { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';
import { AppState } from '../store/types';
import { Window } from '../store/types/model';
import { getWindow } from '../store/selectors/model';
import Control from './control';

type WindowContentProps = {
  windowId: string;
};

const WindowContent: FunctionComponent<WindowContentProps> = ({ windowId }) => {
  const { window } = useConnect(windowId);
  return (
    <div style={getStyleSize(window)} className="mylife-window-container">
      <img src={window.backgroundResource && `/resources/${window.backgroundResource}`} />
      {window.controls.map((control) => (
        <Control
          key={control.id}
          windowId={window.id}
          controlId={control.id}
        />
      ))}
    </div>
  );
};

export default WindowContent;

function getStyleSize(window: Window) {
  const { height, width } = window;
  return { height, width };
}

function useConnect(windowId: string) {
  return useSelector((state: AppState) => ({
    window: getWindow(state, windowId)
  }));
}
