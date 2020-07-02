'use strict';

import path from 'path';
import gulp from 'gulp';
import ts from 'gulp-typescript';
import merge from 'merge2';

export class TsBuild {
  private readonly packagePath: string;
  private readonly project: ts.Project;

  constructor(packageName: string) {
    this.packagePath = path.dirname(require.resolve(`${packageName}/package.json`));
    this.project = ts.createProject(path.join(this.packagePath, 'tsconfig.json'));
    Object.assign(this.task, { displayName: `ts-build - ${packageName}` });
  }

  get globs() {
    return this.project.config.include.map(item => path.join(this.packagePath, item));
  }

  readonly task = () => {

    const result = this.project.src().pipe(this.project());

    const outputPath = path.join(this.packagePath, 'dist');
    return merge([
      result.dts.pipe(gulp.dest(outputPath)),
      result.js.pipe(gulp.dest(outputPath))
    ]);
  };
}