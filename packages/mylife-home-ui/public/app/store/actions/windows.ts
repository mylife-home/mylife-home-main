'use strict';

import async from 'async';
import { createAction } from '@reduxjs/toolkit';
import { WINDOW_NEW, WindowRaw } from '../types/windows';
import { resourceQuery } from './resources';
import { getWindow } from '../selectors/windows';
import { AppThunkAction } from '../types';

const internalWindowNew = createAction<WindowRaw>(WINDOW_NEW);

export const windowLoad = (id: string, done: (err?: Error) => void): AppThunkAction => (dispatch, getState) => {
  const state = getState();
  const window = getWindow(state, { window: id });
  if (window) {
    return done();
  }

  return dispatch(resourceQuery({
    resource: `window.${id}`, done: (err, data) => {
      if (err) { return done(err); }
      const window = JSON.parse(data).window as WindowRaw;

      // load all associated resources
      const resources = new Set<string>();
      addImage(resources, window.background_resource_id);
      for (const control of window.controls) {
        const display = control.display;
        if (!display) { continue; }
        addImage(resources, display.default_resource_id);

        const map = display.map;
        if (!map) { continue; }
        for (const item of map) {
          addImage(resources, item.resource_id);
        }
      }

      async.parallel(Array.from(resources).map(resource => done => dispatch(resourceQuery({ resource, done }))), (err) => {
        if (err) { return done(err); }
        dispatch(internalWindowNew(window));
        return done();
      });
    }
  }));
};

function addImage(resources: Set<string>, id: string) {
  if (id) {
    resources.add(`image.${id}`);
  }
}
