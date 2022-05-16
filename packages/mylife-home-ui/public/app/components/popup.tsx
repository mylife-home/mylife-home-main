import React, { FunctionComponent, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { viewClose } from '../store/actions/view';
import WindowContent from './window-content';
import Overlay from './overlay';
import { AppThunkDispatch } from '../store/types';

type PopupProps = {
  windowId: string;
};

const Popup: FunctionComponent<PopupProps> = ({ windowId }) => {
  const { onWindowClose } = useConnect();
  return (
    <>
      <Overlay onClick={onWindowClose} />
      <div className='mylife-window-popup'>
        <WindowContent windowId={windowId} />
      </div>
    </>
  );
};

export default Popup;

function useConnect() {
  const dispatch = useDispatch<AppThunkDispatch>();

  const onWindowClose = useCallback(() => {
    dispatch(viewClose());
  }, [dispatch]);

  return { onWindowClose };
};
