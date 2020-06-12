'use strict';

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
/* Conditionally adds a default viewport tag if it does not already exist. */
function insertViewport() {

  // do not create if viewport tag already exists
  if (document.querySelector('meta[name="viewport"]'))
    return;

  const viewPortTag = document.createElement('meta');
  viewPortTag.id      ='viewport';
  viewPortTag.name    = 'viewport';
  viewPortTag.content = 'width=max-device-width, height=max-device-height,initial-scale=1.0';
  document.getElementsByTagName('head')[0].appendChild(viewPortTag);
}

function isPortraitOrientation() {
  switch(window.orientation) {
    case -90:
    case 90:
      return false;
  }

  return true;
}

function getDisplayWidth() {
  if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
    if (isPortraitOrientation())
      return screen.width;
    else
      return screen.height;
  }

  return screen.width;
}

function getDisplayHeight() {
  if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
    if (isPortraitOrientation())
      return screen.height;
    else
      return screen.width;
  }

  // I subtract 180 here to compensate for the address bar.  This is imperfect, but seems to work for my Android tablet using Chrome.
  return screen.height - 180;
}

function adjustViewport(requiredWidth, requiredHeight) {

  if (/Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent)) {

    const actualHeight = getDisplayHeight();
    const actualWidth  = getDisplayWidth();
    const minWidth     = requiredWidth;
    const minHeight    = requiredHeight;
    const ratio        = Math.min(actualWidth / minWidth, actualHeight / minHeight);

    console.log(`setting viewport width=${actualWidth} ratio=${ratio}`); // eslint-disable-line no-console
    document.querySelector('meta[name="viewport"]').setAttribute('content', 'initial-scale=' + ratio + ', maximum-scale=' + ratio + ', minimum-scale=' + ratio + ', user-scalable=yes, width=' + actualWidth);
  }
}

function setDimensions(requiredWidth, requiredHeight) {
  console.log(`viewport set dimensions: width=${requiredWidth}, heigth=${requiredHeight}`); // eslint-disable-line no-console
  insertViewport();
  adjustViewport(requiredWidth, requiredHeight);
  window.addEventListener('orientationchange', function() {
    adjustViewport(requiredWidth, requiredHeight);
  });
}

export default { setDimensions };