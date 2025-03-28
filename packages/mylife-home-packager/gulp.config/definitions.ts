import fs from 'fs';
import path from 'path';
import { TsBuild } from './ts-build';
import { WebpackBuild } from './webpack-build';

export const projects = {
  common: {
    ts: new TsBuild('mylife-home-common'),
    version: getPackageVersion('mylife-home-common'),
  },

  ui: {
    ts: new TsBuild('mylife-home-ui'),
    bin: {
      dev: new WebpackBuild('ui', 'bin', 'dev'),
      prod: new WebpackBuild('ui', 'bin', 'prod'),
    },
    client: {
      dev: new WebpackBuild('ui', 'client', 'dev'),
      prod: new WebpackBuild('ui', 'client', 'prod'),
    },
    version: getPackageVersion('mylife-home-ui'),
  },

  core: {
    ts: new TsBuild('mylife-home-core'),
    lib: {
      dev: new WebpackBuild('core', 'lib', 'dev'),
      prod: new WebpackBuild('core', 'lib', 'prod'),
    },
    bin: {
      dev: new WebpackBuild('core', 'bin', 'dev'),
      prod: new WebpackBuild('core', 'bin', 'prod'),
    },
    version: getPackageVersion('mylife-home-core'),
    plugins: {
      // note: should infer that from packager/package.json dependencies
      'driver-absoluta': buildCorePluginProjectConfiguration('driver-absoluta'),
      'driver-broadlink': buildCorePluginProjectConfiguration('driver-broadlink'),
      'driver-lirc': buildCorePluginProjectConfiguration('driver-lirc'),
      'driver-mpd': buildCorePluginProjectConfiguration('driver-mpd'),
      'driver-sensors': buildCorePluginProjectConfiguration('driver-sensors'),
      'driver-tahoma': buildCorePluginProjectConfiguration('driver-tahoma'),
      'logic-base': buildCorePluginProjectConfiguration('logic-base'),
      'logic-clim': buildCorePluginProjectConfiguration('logic-clim'),
      'logic-colors': buildCorePluginProjectConfiguration('logic-colors'),
      'logic-selectors': buildCorePluginProjectConfiguration('logic-selectors'),
      'logic-timers': buildCorePluginProjectConfiguration('logic-timers'),
      'ui-base': buildCorePluginProjectConfiguration('ui-base'),
      // other plugins
    }
  },

  studio: {
    ts: new TsBuild('mylife-home-studio'),
    bin: {
      dev: new WebpackBuild('studio', 'bin', 'dev'),
      prod: new WebpackBuild('studio', 'bin', 'prod'),
    },
    client: {
      dev: new WebpackBuild('studio', 'client', 'dev'),
      prod: new WebpackBuild('studio', 'client', 'prod'),
    },
    version: getPackageVersion('mylife-home-studio'),
  },

  collector: {
    ts: new TsBuild('mylife-home-collector'),
    bin: {
      dev: new WebpackBuild('collector', 'bin', 'dev'),
      prod: new WebpackBuild('collector', 'bin', 'prod'),
    },
    version: getPackageVersion('mylife-home-collector'),
  },
};

function buildCorePluginProjectConfiguration(name: string, wpPptions: { [name: string]: any } = {}) {
  return {
    ts: new TsBuild(`mylife-home-core-plugins-${name}`),
    dev: new WebpackBuild('core', `plugins-${name}`, 'dev', wpPptions),
    prod: new WebpackBuild('core', `plugins-${name}`, 'prod', wpPptions),
    version: getPackageVersion(`mylife-home-core-plugins-${name}`),
  };
}

export const globs = {
  dist: {
    all: pathAsGlobs('dist'),
    dev: pathAsGlobs('dist/dev'),
    prod: pathAsGlobs('dist/prod'),
  },
  common: projects.common.ts.globs,
  ui: {
    bin: projects.ui.ts.globs,
    client: packagePublicGlobs('mylife-home-ui')
  },
  core: {
    main: projects.core.ts.globs,
    plugins: buildCorePluginGlobs()
  },
  studio: {
    bin: projects.studio.ts.globs,
    client: packagePublicGlobs('mylife-home-studio')
  },
  collector: {
    bin: projects.collector.ts.globs,
  },
};

function buildCorePluginGlobs() {
  const globs: { [plugin: string]: string[]; } = {};

  for (const [plugin, config] of Object.entries(projects.core.plugins)) {
    globs[plugin] = config.ts.globs;
  }

  return globs;
}

function pathAsGlobs(part: string) {
  const basePath = path.resolve(path.join(__dirname, '..'));
  return [path.join(basePath, `${part}/**`)];
}

function packagePublicGlobs(packageName: string) {
  const packagePath = path.dirname(require.resolve(`${packageName}/package.json`));
  return ['public/**', 'shared/**'].map(item => path.join(packagePath, item));
}

function getPackageVersion(packageName: string): string {
  const packagePath = path.dirname(require.resolve(`${packageName}/package.json`));
  const fullPath = path.join(packagePath, 'package.json');
  const { version } = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
  return version;
}