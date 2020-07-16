import React, { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';
import { AppState } from '../store/types';
import { getOnline } from '../store/selectors/online';
import { getViewDisplay } from '../store/selectors/view';
import WindowContent from './window-content';
import Offline from './offline';
import Loading from './loading';
import Popup from './popup';

const Application: FunctionComponent = () => (
  <div className='mylife-window-root'>
    <AppContent />
  </div>
);

export default Application;

const AppContent: FunctionComponent = () => {
  const { online, view } = useConnect();

  if (!online) {
    return (
      <Offline />
    );
  }

  if (!view) {
    return (
      <Loading />
    );
  }

  return (
    <>
      <div title={view.main.id}>
        <WindowContent window={view.main} />
      </div>

      {view.popups.map((popup, index) => (
        <Popup key={`${index}_overlay`} window={popup} />
      ))}
    </>
  );
};

function useConnect() {
  return useSelector((state: AppState) => ({
    online: getOnline(state),
    view: getViewDisplay(state)
  }));
}
