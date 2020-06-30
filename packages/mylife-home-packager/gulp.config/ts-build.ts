'use strict';

import path = require('path');
import gulp = require('gulp');
import ts = require('gulp-typescript');
import merge = require('merge2');

export class TsProject {
  private readonly modulePath: string;
  private readonly project: ts.Project;

  constructor(moduleName: string) {
    this.modulePath = path.dirname(require.resolve(`${moduleName}/package.json`));
    this.project = ts.createProject(path.join(this.modulePath, 'tsconfig.json'));
  }

  globs() {
    const ret = this.project.config.include.map(item => path.join(this.modulePath, item));
    console.log(ret);
    return ret;
  }

  createTask() {
    const outputPath = path.join(this.modulePath, 'dist');

    return () => {
      const result = this.project.src().pipe(this.project());
      return merge([
        result.dts.pipe(gulp.dest(outputPath)),
        result.js.pipe(gulp.dest(outputPath))
      ]);
    }
  }
}