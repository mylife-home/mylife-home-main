import React, { FunctionComponent, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppState } from '../store/types';
import { VWindow } from '../store/types/model';
import WindowContent from './window-content';
import Overlay from './overlay';
import { viewClose } from '../store/actions/view';

type PopupProps = {
  window: VWindow
};

const Popup: FunctionComponent<PopupProps> = ({ window }) => {
  const { onWindowClose } = useConnect();
  return (
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
};

export default Popup;

function useConnect() {
  const dispatch = useDispatch();
  return {
    ...useSelector((state: AppState) => ({
      // TODO: fetch window state
    })),
    ...useMemo(() => ({
      onWindowClose: () => dispatch(viewClose())
    }), [dispatch])
  };
};
