'use strict';

import React, { FunctionComponent } from 'react';
import { VView } from '../store/types/view';
import WindowContent from './window-content';

type ActionCallback = (window: string, control: string) => void;
type CloseCallback = () => void;

type WindowProps = {
  online: boolean;
  view: VView;
  onActionPrimary: ActionCallback;
  onActionSecondary: ActionCallback;
  onWindowClose: CloseCallback;
};

function popups(view: VView, onActionPrimary: ActionCallback, onActionSecondary: ActionCallback, onWindowClose: CloseCallback) {
  const components = [];

  for (const [index, popup] of view.popups.entries()) {
    components.push(<div key={`${index}_overlay`} className="mylife-overlay" onClick={onWindowClose} />);
    components.push(
      <div key={`${index}_dialog`} className="mylife-window-popup">
        <div className="modal-content" title={popup.id}>
          <div className="modal-header">
            <button onClick={onWindowClose} className="close">
              x
            </button>
            <h4 className="modal-title">{popup.id}</h4>
          </div>
          <div className="modal-body">
            <WindowContent window={popup} onActionPrimary={onActionPrimary} onActionSecondary={onActionSecondary} />
          </div>
        </div>
      </div>
    );
  }

  return components;
}

const Window: FunctionComponent<WindowProps> = ({ online, view, onActionPrimary, onActionSecondary, onWindowClose }) => (
  <div className="mylife-window-root">
    {/* preload images */}
    <img src="images/spinner.gif" style={{ display: 'none' }} />
    <img src="images/connecting.jpg" style={{ display: 'none' }} />

    {!online && (
      <div className="mylife-overlay-connecting">
        <img src="images/connecting.jpg" />
      </div>
    )}

    {online && !view && (
      <div className="mylife-overlay">
        <img src="images/spinner.gif" />
      </div>
    )}

    {online && view && (
      <div title={view.main.id}>
        <WindowContent window={view.main} onActionPrimary={onActionPrimary} onActionSecondary={onActionSecondary} />
      </div>
    )}

    {online && view && popups(view, onActionPrimary, onActionSecondary, onWindowClose)}
  </div>
);

export default Window;
