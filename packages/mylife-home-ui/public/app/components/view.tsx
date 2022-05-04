import React, { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';
import { AppState } from '../store/types';
import { getView } from '../store/selectors/view';
import WindowContent from './window-content';
import Popup from './popup';
import { useViewport } from '../behaviors/viewport';

const View: FunctionComponent = () => {
  const { view } = useConnect();
  const [ main, ...popups ] = view;
  useViewport(main);
  
  return (
    <>
      <div>
        <WindowContent windowId={main} />
      </div>

      {popups.map((popup, index) => (
        <Popup key={`${index}_overlay`} windowId={popup} />
      ))}
    </>
  );
};

export default View;

function useConnect() {
  return useSelector((state: AppState) => ({
    view: getView(state)
  }));
}
