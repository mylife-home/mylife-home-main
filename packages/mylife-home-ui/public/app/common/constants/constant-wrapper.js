'use strict';

import keyMirror from 'keymirror';

const proxyHandler = {
  get: (target, name) => {
    if(name in target) {
      return target[name];
    }
    throw new Error(`Invalid constant name: '${name}'`);
  }
};

export default function(target) {
  target = keyMirror(target);
  Object.freeze(target);
  if(typeof Proxy !== 'undefined') {
    return new Proxy(target, proxyHandler);
  }
  return target;
}