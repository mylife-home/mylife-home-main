import { series, parallel, watch } from 'gulp';
import del from 'del';
import { argv } from 'yargs';
import { projects, globs } from './definitions';
import { TsBuild } from './ts-build';
import { WebpackBuild } from './webpack-build';
import { createDockerTask } from './docker-build';
import { createNpmPublishTask } from './npm';

const buildProdUi = parallel(
  projects.ui.client.prod.task,
  series(
    projects.common.ts.task,
    projects.ui.ts.task,
    projects.ui.bin.prod.task
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

const buildProdCore = series(
  projects.common.ts.task,
  projects.core.ts.task,
  projects.core.lib.prod.task,
  projects.core.bin.prod.task,
  createProdCorePluginsTask()
);

function createProdCorePluginsTask() {
  const list = Object.values(projects.core.plugins).map(plugin => series(plugin.ts.task, plugin.prod.task));
  return parallel(...list);
}

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

// warning: studio also depends on ui
const buildProdStudio = parallel(
  projects.studio.client.prod.task,
  series(
    projects.common.ts.task,
    projects.studio.ts.task,
    projects.studio.bin.prod.task
  )
);

const buildDevStudio = parallel(
  projects.studio.client.dev.task,
  series(
    projects.common.ts.task,
    projects.studio.ts.task,
    projects.studio.bin.dev.task
  )
);

const watchStudio = series(
  buildDevStudio,
  function watches() {
    watch(globs.studio.client, projects.studio.client.dev.task);
    watch(globs.common, series(
      projects.common.ts.task,
      projects.studio.ts.task,
      projects.studio.bin.dev.task
    ));
    watch(globs.studio.bin, series(
      projects.studio.ts.task,
      projects.studio.bin.dev.task
    ));
  }
);

const publishCore = series(
  buildProdCore,
  createNpmPublishTask({ binaries: 'dist/prod/core', repositoryName: 'mylife-home-core' }),
  createPublishPluginsTask(),
);

function createPublishPluginsTask() {
  // TODO
  const list = Object.keys(projects.core.plugins).map(plugin => createNpmPublishTask({ binaries: `dist/prod/core/plugins/${plugin}`, repositoryName: `mylife-home-core-plugins-${plugin}` }));
  return parallel(...list);
}

const publishUi = series(
  buildProdUi,
  createNpmPublishTask({ binaries: 'dist/prod/ui', repositoryName: 'mylife-home-ui' }),
  createDockerTask({ config: 'docker/ui', binaries: 'dist/prod/ui', imageTag: `vincenttr/mylife-home-ui:${projects.ui.version}`, publish: true })
);

const publishStudio = series(
  buildProdStudio,
  createNpmPublishTask({ binaries: 'dist/prod/studio', repositoryName: 'mylife-home-studio' }),
  createDockerTask({ config: 'docker/studio', binaries: 'dist/prod/studio', imageTag: `vincenttr/mylife-home-studio:${projects.studio.version}`, publish: true })
);

// Testing images
const dockerBuildUi = createDockerTask({ config: 'docker/ui', binaries: 'dist/prod/ui', imageTag: 'mylife-home-ui:testing' });
const dockerBuildUIrcBridge = createDockerTask({ config: 'docker/irc-bridge', binaries: 'dist/prod/core', imageTag: 'mylife-home-core-irc-bridge:testing' });
const dockerBuildStudio = createDockerTask({ config: 'docker/studio', binaries: 'dist/prod/studio', imageTag: 'mylife-home-studio:testing' });

export = {
  'clean': () => del(globs.dist.all),
  'clean:prod': () => del(globs.dist.prod),
  'clean:dev': () => del(globs.dist.dev),
  // TODO: clean ts builds

  'build:prod:core': buildProdCore,
  'build:dev:core': buildDevCore,
  'watch:core': watchCore,

  'build:prod:ui': buildProdUi,
  'build:dev:ui': buildDevUi,
  'watch:ui': watchUi,

  'build:prod:studio': buildProdStudio,
  'build:dev:studio': buildDevStudio,
  'watch:studio': watchStudio,

  'publish:core': publishCore,
  'publish:ui': publishUi,
  'publish:studio': publishStudio,

  // Docker images for testing purposes
  'docker:build:irc-bridge-testing': dockerBuildUIrcBridge,
  'docker:build:ui-testing': dockerBuildUi,
  'docker:build:studio-testing': dockerBuildStudio,

};

function corePluginsListNames() {
  const userPlugins = argv.plugins as string;
  const allPlugins = argv.allPlugins === true;
  const list = new Set(Object.keys(projects.core.plugins));

  if (userPlugins && allPlugins) {
    throw new Error(`You must specify only one of: '--all-plugins', '--plugins=plug1,plug2' (if none, no plugin will be built)`);
  }

  if (allPlugins) {
    return Array.from(list);
  }

  if(userPlugins) {
    const userList = userPlugins.split(',').map(item => item.trim());
    for (const name of userList) {
      if (!list.has(name)) {
        throw new Error(`Unknown plugin '${name}'`);
      }
    }
    return userList;
  }

  // no plugin
  return [];
}

async function noop() {
}
