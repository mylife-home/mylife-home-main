import path from 'path';
import { src, dest, series, parallel } from 'gulp';
import { noop, name, withTempPath, run } from './utils';

export interface DockerTaskOptions {
  readonly config: string;
  readonly binaries: string;
  readonly imageTag: string;
  readonly publish?: boolean;
}

export function createDockerTask(options: DockerTaskOptions) {
  const basePath = path.resolve(path.join(__dirname, '..'));

  return withTempPath('docker-build-', tempPathRef => series(
    parallel(
      name('copy config', () => src([makeSourcePath(options.config), '!**/Dockerfile']).pipe(dest(tempPathRef.path))),
      name('copy binaries', () => src([makeSourcePath(options.binaries), '!**/*.report.html']).pipe(dest(tempPathRef.path)))
    ),
    name('docker build', () => {
      const dockerFilePath =  path.join(basePath, options.config, 'Dockerfile');
      return run('docker', 'build', '--pull', '--no-cache', '-t', options.imageTag, '-f', dockerFilePath, tempPathRef.path);
    }),
    options.publish ? name('docker push', () => run('docker', 'push', options.imageTag)) : noop,
    name('summary', async () => { console.log(`create docker image: '${options.imageTag}'`) }),
  ));

  function makeSourcePath(relative: string) {
    return path.join(basePath, relative) + '/**/*';
  }
}
