import { createAction } from '@reduxjs/toolkit';
import { NAVIGATION_PUSH } from '../types/navigation';

export const navigate = createAction<string>(NAVIGATION_PUSH);
