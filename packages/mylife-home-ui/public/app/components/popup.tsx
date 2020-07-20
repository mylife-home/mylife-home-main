import React, { FunctionComponent, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { viewClose } from '../store/actions/view';
import WindowContent from './window-content';
import Overlay from './overlay';

type PopupProps = {
  windowId: string
};

const Popup: FunctionComponent<PopupProps> = ({ windowId }) => {
  const { onWindowClose } = useConnect();
  return (
    <>
      <Overlay onClick={onWindowClose} />
      <div className='mylife-window-popup'>
        <div className='modal-content' title={windowId}>
          <div className='modal-header'>
            <h4 className='modal-title'>{windowId}</h4>
            <button onClick={onWindowClose} className="close">
              <span>&times;</span>
            </button>
          </div>
          <div className='modal-body'>
            <WindowContent windowId={windowId} />
          </div>
        </div>
      </div>
    </>
  );
};

export default Popup;

function useConnect() {
  const dispatch = useDispatch();
  return useMemo(() => ({
    onWindowClose: () => dispatch(viewClose())
  }), [dispatch]);
};
