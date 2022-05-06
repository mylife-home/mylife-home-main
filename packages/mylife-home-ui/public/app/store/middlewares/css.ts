import { Middleware } from 'redux';
import { PayloadAction } from '@reduxjs/toolkit';
import { CSS_SET } from '../types/css';

export const cssMiddleware: Middleware = (store) => (next) => (action) => {
  if (action.type === CSS_SET) {
    const typedAction = action as PayloadAction<string>;
    const resource = typedAction.payload;
    setCss(resource);
  }

  return next(action);
};

function setCss(resource: string) {
  const cssId = 'user-css';

  let link = document.getElementById('user-css') as HTMLLinkElement;
  if (!link) {
    const head = document.getElementsByTagName('head')[0];
    link = document.createElement('link');
    link.id   = cssId;
    link.rel  = 'stylesheet';
    link.type = 'text/css';
    link.media = 'all';
    head.appendChild(link);
  }

  link.href = `/resources/${resource}`;
}