import React, { FunctionComponent, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { viewClose } from '../store/actions/view';
import WindowContent from './window-content';
import Overlay from './overlay';
import { AppState } from '../store/types';
import { getWindowTitle } from '../store/selectors/model';

type PopupProps = {
  windowId: string;
};

const Popup: FunctionComponent<PopupProps> = ({ windowId }) => {
  const { title, onWindowClose } = useConnect(windowId);
  return (
    <>
      <Overlay onClick={onWindowClose} />
      <div className='mylife-window-popup'>
        <div className='modal-content'>
          <div className='modal-header'>
            <h4 className='modal-title'>{title}</h4>
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

function useConnect(windowId: string) {
  const dispatch = useDispatch();

  const onWindowClose = useCallback(() => {
    dispatch(viewClose());
  }, [dispatch]);

  const title = useSelector((state: AppState) => getWindowTitle(state, windowId));

  return { onWindowClose, title };
};
