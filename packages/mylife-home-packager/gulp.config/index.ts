import path from 'path';
import { series, parallel, watch } from 'gulp';
import del from 'del';
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
    },
    plugins: {
      irc: {
        ts: new TsBuild('mylife-home-core-plugins-irc'),
        dev: new WebpackBuild('core', 'plugins-irc', 'dev'),
        prod: new WebpackBuild('core', 'plugins-irc', 'prod'),
      }
      // other plugins
    }
  }
};

const globs = {
  dist: pathAbs('dist'),
  distDev: pathAbs('dist', 'dev'),
  distProd: pathAbs('dist', 'prod'),
}

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
        ),
        parallel(
          series(
            projects.core.plugins.irc.ts.task,
            projects.core.plugins.irc.prod.task
          )
          // other plugins
        )
      )
    )
  )
);

const buildDevUi = parallel(
  projects.ui.client.dev.task,
  series(
    projects.common.ts.task,
    projects.ui.ts.task,
    projects.ui.bin.dev.task
  )
);

export = {
  'clean': () => del(globs.dist),
  'clean:prod': () => del(globs.distProd),
  'clean:dev': () => del(globs.distDev),
  'build:dev:ui': buildDevUi,
  'watch:ui': null,
  'build:dev:core': null,
  'watch:core': null,
  'build:prod': buildProd,
};

function pathAbs(...parts: string[]) {
  return path.join(path.resolve(path.join(__dirname, '..')), ...parts);
}

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