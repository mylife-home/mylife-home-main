import path from 'path';
import { TsBuild } from './ts-build';
import { WebpackBuild } from './webpack-build';

export const projects = {
  common: {
    ts: new TsBuild('mylife-home-common')
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
    }
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
    plugins: {
      irc: projects.core.plugins.irc.ts.globs
      // other plugins
    }
  }
};

function pathAsGlobs(part: string) {
  const basePath = path.resolve(path.join(__dirname, '..'));
  return [path.join(basePath, `${part}/**`)];
}

function packagePublicGlobs(packageName: string) {
  const packagePath = path.dirname(require.resolve(`${packageName}/package.json`));
  return ['public/**', 'shared/**'].map(item => path.join(packagePath, item));
}
