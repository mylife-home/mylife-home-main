'use strict';

import { createAction } from '@reduxjs/toolkit';
import { ResourceQuery, RESOURCE_QUERY } from '../types/resources';

export const resourceQuery = createAction<ResourceQuery>(RESOURCE_QUERY);
