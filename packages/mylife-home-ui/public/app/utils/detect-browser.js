'use strict';

const userAgent = window.navigator.userAgent;
const isAndroid = /android/i.test(userAgent);
const isIOS = /iPad|iPhone|iPod/.test(userAgent);

console.log(`isAndoid: ${isAndroid}, isIOS: ${isIOS}`); // eslint-disable-line no-console

export default { isMobile: isAndroid || isIOS };