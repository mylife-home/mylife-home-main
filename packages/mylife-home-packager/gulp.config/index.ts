import { series, parallel } from 'gulp';
import { TsBuild } from './ts-build';
import { WebpackBuild } from './webpack-build';

const projects = {
  common : {
    ts: new TsBuild('mylife-home-common')
  },

  ui : {
    ts: new TsBuild('mylife-home-ui'),
    bin: {
      dev: new WebpackBuild('ui', 'bin', 'dev'),
      prod: new WebpackBuild('ui', 'bin', 'prod'),
    },
    client: {
      dev: new WebpackBuild('ui', 'client', 'dev'),
      prod: new WebpackBuild('ui', 'client', 'prod'),
    }
  },

  core : {
    ts: new TsBuild('mylife-home-core'),
    lib: {
      dev: new WebpackBuild('core', 'lib', 'dev'),
      prod: new WebpackBuild('core', 'lib', 'prod'),
    },
    bin: {
      dev: new WebpackBuild('core', 'bin', 'dev'),
      prod: new WebpackBuild('core', 'bin', 'prod'),
    }
    // TODO: plugins
  }
};

const buildProd = parallel(
  projects.ui.client.prod.task,
  series(
    projects.common.ts.task,
    parallel(
      series(
        projects.ui.ts.task,
        projects.ui.bin.prod.task
      ),
      series(
        projects.core.ts.task, 
        parallel(
          projects.core.lib.prod.task,
          projects.core.bin.prod.task
        )
      )
    )
  )
);

const binaries = {
  core: ['mylife-home-core', 'mylife-core-plugins-*'],
  ui: ['mylife-home-ui']
};

export = {
  'build:dev:ui': null,
  'watch:ui': null,
  'build:dev:core': null,
  'watch:core': null,
  'build:prod': buildProd,
};

/*
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
*/