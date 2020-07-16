import React, { FunctionComponent, useMemo } from 'react';
import { VWindow } from '../store/types/model';
import WindowContent from './window-content';
import Overlay from './overlay';
import Offline from './offline';
import Loading from './loading';

import { useDispatch, useSelector } from 'react-redux';
import { AppState } from '../store/types';
import { getOnline } from '../store/selectors/online';
import { getViewDisplay } from '../store/selectors/view';
import { actionPrimary, actionSecondary } from '../store/actions/actions';
import { viewClose } from '../store/actions/view';

type CloseCallback = () => void;

type PopupProps = {
  window: VWindow,
  onWindowClose: CloseCallback
};

const Popup: FunctionComponent<PopupProps> = ({ window, onWindowClose }) => (
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
          <WindowContent window={window} />
        </div>
      </div>
    </div>
  </>
);

const useConnect = () => {
  const dispatch = useDispatch();
  return {
    ...useSelector((state: AppState) => ({
      online: getOnline(state),
      view: getViewDisplay(state)
    })),
    ...useMemo(() => ({
      onActionPrimary: (windowId: string, componentId: string) => dispatch(actionPrimary(windowId, componentId)),
      onActionSecondary: (windowId: string, componentId: string) => dispatch(actionSecondary(windowId, componentId)),
      onWindowClose: () => dispatch(viewClose())
        }), [dispatch])
  };
};

const Window: FunctionComponent = () => {
  const { online, view, onActionPrimary, onActionSecondary, onWindowClose } = useConnect();
  return (
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
            <WindowContent window={view.main} />
          </div>

          {view.popups.map((popup, index) => (
            <Popup key={`${index}_overlay`} window={popup} onWindowClose={onWindowClose}/>
          ))}
        </>
      )}
    </div>
  );
};

export default Window;
