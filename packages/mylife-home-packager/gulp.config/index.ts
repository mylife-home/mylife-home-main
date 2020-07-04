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
  dist: {
    all: pathAsGlobs('dist'),
    dev: pathAsGlobs('dist/dev'),
    prod: pathAsGlobs('dist/prod'),
  },
  common: projects.common.ts.globs,
  ui: {
    bin: projects.ui.ts.globs,
    client: packagePublicGlobs('mylife-home-ui')
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
        projects.core.lib.prod.task,
        projects.core.bin.prod.task,
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

const watchUi = series(
  buildDevUi,
  function watches() {
    watch(globs.ui.client, projects.ui.client.dev.task);
    watch(globs.common, series(
      projects.common.ts.task,
      projects.ui.ts.task,
      projects.ui.bin.dev.task
    ));
    watch(globs.ui.bin, series(
      projects.ui.ts.task,
      projects.ui.bin.dev.task
    ));
  }
);

export = {
  'clean': () => del(globs.dist.all),
  'clean:prod': () => del(globs.dist.prod),
  'clean:dev': () => del(globs.dist.dev),
  // TODO: clean ts builds

  'build:dev:ui': buildDevUi,
  'watch:ui': watchUi,

  'build:dev:core': null, // TODO
  'watch:core': null, // TODO

  'build:prod': buildProd,
};

function pathAsGlobs(part: string) {
  const basePath = path.resolve(path.join(__dirname, '..'));
  return [path.join(basePath, `${part}/**`)];
}

function packagePublicGlobs(packageName: string) {
  const packagePath = path.dirname(require.resolve(`${packageName}/package.json`));
  return [path.join(packagePath, 'public/**')];
}
