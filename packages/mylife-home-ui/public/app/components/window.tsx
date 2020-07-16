'use strict';

import React, { FunctionComponent } from 'react';
import { VView } from '../store/types/view';
import { VWindow } from '../store/types/model';
import WindowContent from './window-content';
import Overlay from './overlay';
import Offline from './offline';
import Loading from './loading';

type ActionCallback = (window: string, control: string) => void;
type CloseCallback = () => void;

type WindowProps = {
  online: boolean;
  view: VView;
  onActionPrimary: ActionCallback;
  onActionSecondary: ActionCallback;
  onWindowClose: CloseCallback;
};

type PopupProps = {
  window: VWindow,
  onActionPrimary: ActionCallback,
  onActionSecondary: ActionCallback,
  onWindowClose: CloseCallback
};

const Popup: FunctionComponent<PopupProps> = ({ window, onActionPrimary, onActionSecondary, onWindowClose }) => (
  <>
    <Overlay onClick={onWindowClose} />
    <div className='mylife-window-popup'>
      <div className='modal-content' title={window.id}>
        <div className='modal-header'>
          <button onClick={onWindowClose} className="close">
            x
          </button>
          <h4 className='modal-title'>{window.id}</h4>
        </div>
        <div className='modal-body'>
          <WindowContent window={window} onActionPrimary={onActionPrimary} onActionSecondary={onActionSecondary} />
        </div>
      </div>
    </div>
  </>
);

const Window: FunctionComponent<WindowProps> = ({ online, view, onActionPrimary, onActionSecondary, onWindowClose }) => (
  <div className='mylife-window-root'>
    {!online && (
      <Offline />
    )}

    {online && !view && (
      <Loading />
    )}

    {online && view && (
      <>
        <div title={view.main.id}>
          <WindowContent window={view.main} onActionPrimary={onActionPrimary} onActionSecondary={onActionSecondary} />
        </div>

        {view.popups.map((popup, index) => (
          <Popup key={`${index}_overlay`} window={popup} onActionPrimary={onActionPrimary} onActionSecondary={onActionSecondary} onWindowClose={onWindowClose}/>
        ))}
      </>
    )}
  </div>
);

export default Window;
