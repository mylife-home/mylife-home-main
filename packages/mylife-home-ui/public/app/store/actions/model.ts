'use strict';

import { createAction } from '@reduxjs/toolkit';
import { AppThunkAction } from '../types';
import { WINDOW_NEW, WINDOW_CLEAR, WindowRaw } from '../types/model';
import { resourceQuery } from './resources';
import { viewInit } from './view';

const windowNew = createAction<WindowRaw>(WINDOW_NEW);
const windowClear = createAction(WINDOW_CLEAR);

export const modelInit = (modelHash: string): AppThunkAction => (dispatch, getState) => {
  console.log('modelInit with modelHash', modelHash); // eslint-disable-line no-console

  return dispatch(resourceQuery({
    resource: modelHash, done: (err, model) => {
      if (err) { return console.error(err); } // eslint-disable-line no-console

      dispatch(windowClear());
      for (const window of model.windows) {
        dispatch(windowNew(window));
      }

      dispatch(viewInit(model.defaultWindow));
    }
  }));
};
