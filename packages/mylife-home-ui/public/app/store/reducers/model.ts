import { createReducer, PayloadAction } from '@reduxjs/toolkit';
import { MODEL_SET, NetModel, Model } from '../types/model';

const DEFAULT: Model = { defaultWindow: {}, windows: {}, controls: {} };

export default createReducer(DEFAULT, {
  [MODEL_SET]: (state, action: PayloadAction<NetModel>) => {
    const model: Model = {
      defaultWindow: action.payload.defaultWindow,
      windows: {},
      controls: {},
    };

    for (const window of action.payload.windows) {
      model.windows[window.id] = window;

      for (const control of window.controls) {
        model.controls[`${window.id}$${control.id}`] = control;
      }
    }

    return model;
  },
});
