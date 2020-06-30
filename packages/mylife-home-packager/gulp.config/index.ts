'use strict';

import * as gulp from 'gulp';
import { TsProject } from './ts-build';

const commonProject = new TsProject('mylife-home-common');

export = {
  default: () => {
    const tsBuildTask = commonProject.createTask();
    return gulp.src(commonProject.globs()).pipe(tsBuildTask());
  },

  watch: () => {
    return gulp.watch(commonProject.globs(), commonProject.createTask());
  }
};
