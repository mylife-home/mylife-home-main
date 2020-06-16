import { createAction } from '@reduxjs/toolkit';
import { ONLINE_SET } from '../types/online';

export const onlineSet = createAction<boolean>(ONLINE_SET);
