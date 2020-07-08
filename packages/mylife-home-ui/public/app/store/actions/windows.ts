'use strict';

import { createAction } from '@reduxjs/toolkit';
import { WINDOW_NEW, WINDOW_CLEAR, WindowRaw } from '../types/windows';

export const windowNew = createAction<WindowRaw>(WINDOW_NEW);
export const windowClear = createAction(WINDOW_CLEAR);
