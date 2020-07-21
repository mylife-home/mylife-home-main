import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { isMobile, isIOS } from '../utils/detect-browser';
import { AppState } from '../store/types';
import { getWindow } from '../store/selectors/model';

export interface Size {
  readonly width: number;
  readonly height: number;
}

export function useViewport(windowId: string) {
  if (!isMobile) {
    return;
  }

  const { window } = useConnect(windowId);
  return useMobileViewport({ width: window.width, height: window.height });
}

function useConnect(windowId: string) {
  return useSelector((state: AppState) => ({
    window: getWindow(state, windowId)
  }));
}

function useMobileViewport(size: Size) {

  /** Steven Yang, July 2016
  Based on http://stackoverflow.com/questions/21419404/setting-the-viewport-to-scale-to-fit-both-width-and-height , this Javascript code allows you to
  cause the viewport to auto-adjust based on a desired pixel width and height
  that must be visible on the screen.

  This code has been tested on an iPhone6 and a 7" Samsung Galaxy Tab.
  In my case, I have a game with the exact dimensions of 990 x 660.  This
  script allows me to make the game render within the screen, regardless
  of whether you are in landscape or portrait mode, and it works even
  when you hit refresh or rotate your device.

  Please use this code freely.  Credit is appreciated, but not required!
  */

  useEffect(() => {
    insertViewport();
    window.addEventListener('orientationchange', adjustViewport);

    return () => {
      window.removeEventListener('orientationchange', adjustViewport);
    };
  }, []);

  useEffect(() => setDimensions(size.width, size.height), [size.width, size.height]);

  const initialSize: Size = null;
  const requiredSizeRef = useRef(initialSize);

  function setDimensions(requiredWidth: number, requiredHeight: number) {
    console.log(`viewport set dimensions: width=${requiredWidth}, heigth=${requiredHeight}`); // eslint-disable-line no-console
    requiredSizeRef.current = { width: requiredWidth, height: requiredHeight };
    adjustViewport();
  }

  //  Conditionally adds a default viewport tag if it does not already exist.
  function insertViewport() {
    // do not create if viewport tag already exists
    if (document.querySelector('meta[name="viewport"]')) return;

    const viewPortTag = document.createElement('meta');
    viewPortTag.id = 'viewport';
    viewPortTag.name = 'viewport';
    viewPortTag.content = 'width=max-device-width, height=max-device-height,initial-scale=1.0';
    document.getElementsByTagName('head')[0].appendChild(viewPortTag);
  }

  function adjustViewport() {
    if (!requiredSizeRef.current) {
      return;
    }

    const actualSize = getDisplaySize();
    const ratio = Math.min(actualSize.width / requiredSizeRef.current.width, actualSize.height / requiredSizeRef.current.height);

    console.log(`setting viewport width=${actualSize.width} ratio=${ratio}`); // eslint-disable-line no-console
    document
      .querySelector('meta[name="viewport"]')
      .setAttribute('content', 'initial-scale=' + ratio + ', maximum-scale=' + ratio + ', minimum-scale=' + ratio + ', user-scalable=yes, width=' + actualSize.width);
  }
}


function getDisplaySize() {
  return !isIOS || isPortraitOrientation() ? screen : rotate(screen);
}

function isPortraitOrientation() {
  switch (window.orientation) {
    case -90:
    case 90:
      return false;
  }

  return true;
}

function rotate(size: Size): Size {
  return { width: size.height, height: size.width };
}