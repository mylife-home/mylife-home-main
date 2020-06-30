'use strict';

import path = require('path');
import gulp = require('gulp');
import ts = require('gulp-typescript');
import merge = require('merge2');

const modulePath = path.dirname(require.resolve('mylife-home-common/package.json'));

const tsProject = ts.createProject(path.join(modulePath, 'tsconfig.json'));

export = {
  default: function (cb) {
    var tsResult = tsProject.src() // or tsProject.src()
      .pipe(tsProject());

    const outputPath = path.join(modulePath, 'dist');
    return merge([
      tsResult.dts.pipe(gulp.dest(outputPath)),
      tsResult.js.pipe(gulp.dest(outputPath))
    ]);
  }
};
