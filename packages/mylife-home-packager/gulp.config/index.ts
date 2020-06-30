'use strict';

import * as gulp from 'gulp';
import { TsBuild } from './ts-build';

const commonProject = new TsBuild('mylife-home-common');

export = {
  default: () => {
    return gulp.src(commonProject.globs).pipe(commonProject.task());
  },

  watch: () => {
    return gulp.watch(commonProject.globs, commonProject.task);
  }
};
