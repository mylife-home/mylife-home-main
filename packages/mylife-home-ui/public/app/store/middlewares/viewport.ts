import { Middleware } from 'redux';
import { VIEW_CHANGE } from '../types/view';
import { getWindow } from '../selectors/model';
import { isMobile, isIOS } from '../../utils/detect-browser';

export function createViewportMiddleware(): Middleware {
  // nothing to do on desktop
  if (!isMobile) {
    return (store) => (next) => (action) => next(action);
  }

  return createMobileMiddleware();
}

function createMobileMiddleware(): Middleware {

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

  interface Size {
    readonly width: number;
    readonly height: number;
  }

  let requiredSize: Size;

  window.addEventListener('orientationchange', adjustViewport);

  insertViewport();

  return (store) => (next) => (action) => {
    switch (action.type) {
      case VIEW_CHANGE: {
        const state = store.getState();
        const windowId = action.payload;
        const window = getWindow(state, windowId);
        setDimensions(window.width, window.height);
      }
    }

    return next(action);
  };

  function setDimensions(requiredWidth: number, requiredHeight: number) {
    console.log(`viewport set dimensions: width=${requiredWidth}, heigth=${requiredHeight}`); // eslint-disable-line no-console
    requiredSize = { width: requiredWidth, height: requiredHeight };
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
    if (!requiredSize || !isMobile) {
      return;
    }

    const actualSize = getDisplaySize();
    const ratio = Math.min(actualSize.width / requiredSize.width, actualSize.height / requiredSize.height);

    console.log(`setting viewport width=${actualSize.width} ratio=${ratio}`); // eslint-disable-line no-console
    document
      .querySelector('meta[name="viewport"]')
      .setAttribute('content', 'initial-scale=' + ratio + ', maximum-scale=' + ratio + ', minimum-scale=' + ratio + ', user-scalable=yes, width=' + actualSize.width);
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
}
