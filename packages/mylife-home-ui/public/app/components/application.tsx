import React, { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';
import { AppState } from '../store/types';
import { getOnline } from '../store/selectors/online';
import { hasView } from '../store/selectors/view';
import { hasWindows } from '../store/selectors/model';
import Offline from './offline';
import Loading from './loading';
import View from './view';

const Application: FunctionComponent = () => (
  <div className="mylife-window-root">
    {/* preload resources */}
    <img src='images/spinner.gif' style={{ display: 'none' }} />
    <img src='images/connecting.gif' style={{ display: 'none' }} />

    <AppContent />
  </div>
);

export default Application;

const AppContent: FunctionComponent = () => {
  const { online, ready } = useConnect();

  if (!online) {
    return <Offline />;
  }

  if (!ready) {
    return <Loading />;
  }

  return <View />;
};

function useConnect() {
  return useSelector((state: AppState) => ({
    online: getOnline(state),
    ready: hasView(state) && hasWindows(state),
  }));
}
