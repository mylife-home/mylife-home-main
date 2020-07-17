import { createAction } from '@reduxjs/toolkit';
import { AppThunkAction } from '../types';
import { MODEL_SET, Window, Model } from '../types/model';
import { resourceQuery } from './resources';
import { viewInit } from './view';

const modelSet = createAction<Window[]>(MODEL_SET);

export const modelInit = (modelHash: string): AppThunkAction => (dispatch, getState) => {
  console.log('modelInit with modelHash', modelHash); // eslint-disable-line no-console

  dispatch(resourceQuery({
    resource: modelHash, 
    onContent: (content: any) => {
      const model = content as Model;

      dispatch(modelSet(model.windows));
      dispatch(viewInit(model.defaultWindow));
    }
  }));
};
