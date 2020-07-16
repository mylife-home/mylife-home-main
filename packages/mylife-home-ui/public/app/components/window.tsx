import React, { FunctionComponent, useMemo } from 'react';
import WindowContent from './window-content';
import Offline from './offline';
import Loading from './loading';
import Popup from './popup';

import { useDispatch, useSelector } from 'react-redux';
import { AppState } from '../store/types';
import { getOnline } from '../store/selectors/online';
import { getViewDisplay } from '../store/selectors/view';
import { actionPrimary, actionSecondary } from '../store/actions/actions';
import { viewClose } from '../store/actions/view';

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
  const { online, view } = useConnect();
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
            <Popup key={`${index}_overlay`} window={popup} />
          ))}
        </>
      )}
    </div>
  );
};

export default Window;
