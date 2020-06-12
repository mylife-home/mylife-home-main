'use strict';

import async from 'async';
import { createAction } from 'redux-actions';
import { actionTypes } from '../constants';

import { resourceQuery } from './resources';
import { getWindow } from '../selectors/windows';

const internalWindowNew = createAction(actionTypes.WINDOW_NEW);

function addImage(resources, id) {
  if(!id) { return; }
  resources.add(`image.${id}`);
}

export const windowLoad = (id, done) => (dispatch, getState) => {
  const state = getState();
  const window = getWindow(state, {window : id});
  if(window) {
    return done(null, id);
  }

  return dispatch(resourceQuery({ resource: `window.${id}`, done: (err, data) => {
    if(err) { return done(err); }
    const window = JSON.parse(data).window;

    // load all associated resources
    const resources = new Set();
    addImage(resources, window.background_resource_id);
    for(const control of window.controls) {
      const display = control.display;
      if(!display) { continue; }
      addImage(resources, display.default_resource_id);

      const map = display.map;
      if(!map) { continue; }
      for(const item of map) {
        addImage(resources, item.resource_id);
      }
    }

    async.parallel(Array.from(resources).map(resource => done => dispatch(resourceQuery({ resource, done }))), (err) => {
      if(err) { return done(err); }
      dispatch(internalWindowNew(window));
      return done(null, window);
    });
  }}));
};
