import { series, parallel, watch } from 'gulp';
import del from 'del';
import { argv } from 'yargs';
import { projects, globs } from './definitions';

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
