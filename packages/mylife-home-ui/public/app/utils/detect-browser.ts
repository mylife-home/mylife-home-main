'use strict';

const userAgent = window.navigator.userAgent;
export const isAndroid = /android/i.test(userAgent);
export const isIOS = /iPad|iPhone|iPod/.test(userAgent);
export const isMobile = isAndroid || isIOS;

console.log(`isAndoid: ${isAndroid}, isIOS: ${isIOS}`); // eslint-disable-line no-console

