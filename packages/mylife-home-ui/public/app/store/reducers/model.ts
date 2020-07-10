import { createReducer, PayloadAction } from '@reduxjs/toolkit';
import { Map, List } from 'immutable';
import { ControlDisplay, ControlText, Control, Window, MODEL_SET } from '../types/model';
import * as shared from '../../../../shared/model';

export default createReducer(Map<string, Window>(), {
  [MODEL_SET]: (state, action: PayloadAction<shared.Window[]>) => {
    return state.withMutations(map => {
      map.clear();
      for (const rawWindow of action.payload) {
        const window = createWindow(rawWindow);
        map.set(window.id, window);
      }
    });
  }
});

function createWindow(raw: shared.Window): Window {
  const { controls, ...others } = raw;
  return {
    controls: Map(
      controls.map((item) => {
        const ctrl = createControl(item);
        return [ctrl.id, ctrl];
      })
    ),
    ...others,
  };
}

function createControl(raw: shared.Control): Control {
  const { display, text, ...others } = raw;
  return {
    display: createDisplay(display),
    text: createText(text),
    ...others,
  };
}

function createDisplay(raw: shared.ControlDisplay): ControlDisplay {
  if (!raw) {
    return null;
  }
  const { map, ...others } = raw;
  return {
    map: List(map),
    ...others,
  };
}

function createText(raw: shared.ControlText): ControlText {
  if (!raw) {
    return null;
  }
  const { context, format, ...others } = raw;

  const argNames = context.map((item) => item.id).join(',');
  let func: (args: string[]) => string;
  try {
    func = new Function(argNames, format) as (args: string[]) => string;
  } catch (err) {
    console.error(err); // eslint-disable-line no-console
    func = () => err.message;
  }

  return {
    context: List(context),
    format,
    func,
    ...others,
  };
}
