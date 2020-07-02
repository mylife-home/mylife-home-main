import * as gulp from 'gulp';
import { TsBuild } from './ts-build';
import { WebpackBuild } from './webpack-build';

const commonProject = new TsBuild('mylife-home-common');
const coreProject = new TsBuild('mylife-home-core');
const corePluginsIrcProject = new TsBuild('mylife-home-core-plugins-irc');
const uiProject = new TsBuild('mylife-home-ui');

const core = gulp.series(coreProject.task, gulp.parallel(corePluginsIrcProject.task));
const all = gulp.series(commonProject.task, gulp.parallel(core, uiProject.task));

const watch = gulp.parallel(() => gulp.watch(commonProject.globs, commonProject.task), () => gulp.watch(coreProject.globs, coreProject.task));

const webpackDevUi = new WebpackBuild('ui', 'dev');

const devUi = gulp.series(webpackDevUi.task);

export = {
  default: all,

  'build:ts': all,

  'build:dev:ui': devUi,

  watch
};
