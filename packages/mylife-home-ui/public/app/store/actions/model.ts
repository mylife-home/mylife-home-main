'use strict';

import { AppThunkAction } from '../types';
import { resourceQuery } from './resources';
import { windowClear, windowNew } from './windows';
import { viewInit } from './view';

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
