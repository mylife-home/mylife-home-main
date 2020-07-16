import React, { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';
import { AppState } from '../store/types';
import { getOnline } from '../store/selectors/online';
import { getViewDisplay } from '../store/selectors/view';
import WindowContent from './window-content';
import Offline from './offline';
import Loading from './loading';
import Popup from './popup';


const Application: FunctionComponent = () => {
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

export default Application;

function useConnect() {
  return useSelector((state: AppState) => ({
    online: getOnline(state),
    view: getViewDisplay(state)
  }));
}
