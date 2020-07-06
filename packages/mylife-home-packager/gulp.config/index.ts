import { series, parallel, watch } from 'gulp';
import del from 'del';
import { argv } from 'yargs';
import { projects, globs } from './definitions';
import { TsBuild } from './ts-build';
import { WebpackBuild } from './webpack-build';

type CorePluginDefinition = {
  readonly ts: TsBuild;
  readonly dev: WebpackBuild;
  readonly prod: WebpackBuild;
};

type CorePluginsDefinition = {
  [name: string]: CorePluginDefinition;
};

type CorePluginsGlobs = {
  [name: string]: string[];
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
        createProdCorePluginsTask()
      )
    )
  )
);

function createProdCorePluginsTask() {
  const list = Object.values(projects.core.plugins).map(plugin => series(plugin.ts.task, plugin.prod.task));
  return parallel(...list);
}

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

const buildDevCore = series(
  projects.common.ts.task,
  projects.core.ts.task,
  projects.core.lib.dev.task,
  projects.core.bin.dev.task,
  createDevCorePluginsTask()
);

const watchCore = series(
  buildDevCore,
  function watches() {
    watch(globs.common, buildDevCore);
    watch(globs.core.main, series(
      projects.core.ts.task,
      projects.core.lib.dev.task,
      projects.core.bin.dev.task,
      createDevCorePluginsTask()
    ));

    const names = corePluginsListNames();
    const pluginsGlobs = globs.core.plugins as CorePluginsGlobs;

    for (const name of names) {
      watch(pluginsGlobs[name], createDevCorePluginTask(name));
    }
  }
);

function createDevCorePluginsTask() {
  const names = corePluginsListNames();
  if (!names.length) {
    return noop;
  }

  const list = names.map(createDevCorePluginTask);
  return parallel(...list);
}

function createDevCorePluginTask(name: string) {
  const plugins = projects.core.plugins as CorePluginsDefinition;
  const plugin = plugins[name];
  return series(plugin.ts.task, plugin.dev.task);
}

export = {
  'clean': () => del(globs.dist.all),
  'clean:prod': () => del(globs.dist.prod),
  'clean:dev': () => del(globs.dist.dev),
  // TODO: clean ts builds

  'build:dev:ui': buildDevUi,
  'watch:ui': watchUi,

  'build:dev:core': buildDevCore,
  'watch:core': watchCore,

  'build:prod': buildProd,
};

function corePluginsListNames() {
  const userPlugins = argv.plugins as string;
  const noPlugin = argv.plugin === false;
  const allPlugin = argv.allPlugins === true;
  const list = new Set(Object.keys(projects.core.plugins));

  let setCount = 0;
  if (userPlugins) {
    ++setCount;
  }
  if (noPlugin) {
    ++setCount;
  }
  if (allPlugin) {
    ++setCount;
  }

  if (setCount !== 1) {
    throw new Error(`You must specify one of: '--no-plugin', '--all-plugins', '--plugins=plug1,plug2'`);
  }

  if (noPlugin) {
    return [];
  }

  if (allPlugin) {
    return Array.from(list);
  }

  const userList = userPlugins.split(',').map(item => item.trim());
  for (const name of userList) {
    if (!list.has(name)) {
      throw new Error(`Unknown plugin '${name}'`);
    }
  }
  return userList;
}

async function noop() {
}
