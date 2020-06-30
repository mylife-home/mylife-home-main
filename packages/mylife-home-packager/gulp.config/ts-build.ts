'use strict';

import path = require('path');
import gulp = require('gulp');
import ts = require('gulp-typescript');
import merge = require('merge2');

export class TsBuild {
  private readonly modulePath: string;
  private readonly project: ts.Project;

  constructor(moduleName: string) {
    this.modulePath = path.dirname(require.resolve(`${moduleName}/package.json`));
    this.project = ts.createProject(path.join(this.modulePath, 'tsconfig.json'));
    Object.assign(this.task, { displayName: `ts-build - ${moduleName}` });
  }

  get globs() {
    return this.project.config.include.map(item => path.join(this.modulePath, item));
  }

  readonly task = () => {

    const result = this.project.src().pipe(this.project());

    const outputPath = path.join(this.modulePath, 'dist');
    return merge([
      result.dts.pipe(gulp.dest(outputPath)),
      result.js.pipe(gulp.dest(outputPath))
    ]);
  };
}