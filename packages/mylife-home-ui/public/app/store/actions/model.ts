import { createAction } from '@reduxjs/toolkit';
import { Window } from '../../../../shared/model';
import { AppThunkAction } from '../types';
import { WINDOW_NEW, WINDOW_CLEAR } from '../types/model';
import { resourceQuery } from './resources';
import { viewInit } from './view';

const windowNew = createAction<Window>(WINDOW_NEW);
const windowClear = createAction(WINDOW_CLEAR);

export const modelInit = (modelHash: string): AppThunkAction => (dispatch, getState) => {
  console.log('modelInit with modelHash', modelHash); // eslint-disable-line no-console

  return dispatch(resourceQuery({
    resource: modelHash, done: (err, data) => {
      if (err) { return console.error(err); } // eslint-disable-line no-console
      const model = JSON.parse(data);

      dispatch(windowClear());
      for (const window of model.windows) {
        dispatch(windowNew(window));
      }

      dispatch(viewInit(model.defaultWindow));
    }
  }));
};
