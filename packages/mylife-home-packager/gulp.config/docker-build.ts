import path from 'path';
import { src, dest, series, parallel } from 'gulp';
import { noop, name, withTempPath, run } from './utils';

export interface DockerTaskOptions {
  readonly config: string;
  readonly binaries: string;
  readonly imageTags: string[];
  readonly publish?: boolean;
}

export function createDockerTask(options: DockerTaskOptions) {
  const basePath = path.resolve(path.join(__dirname, '..'));
  const publishTasks = options.publish ? 
    options.imageTags.map(tag => name(`docker push ${tag}`, () => run('docker', 'push', tag))) :
    [];

  return withTempPath('docker-build-', tempPathRef => series(
    parallel(
      name('copy config', () => src([makeSourcePath(options.config), '!**/Dockerfile']).pipe(dest(tempPathRef.path))),
      name('copy binaries', () => src([makeSourcePath(options.binaries), '!**/*.report.html']).pipe(dest(tempPathRef.path)))
    ),
    name('docker build', () => {
      const dockerFilePath =  path.join(basePath, options.config, 'Dockerfile');
      const tags = options.imageTags.map(tag => ['-t', tag]).flat();
      return run('docker', 'build', '--pull', '--no-cache', ...tags, '-f', dockerFilePath, tempPathRef.path);
    }),
    ...publishTasks,
    name('summary', async () => { console.log(`create docker image: '${options.imageTags[0]}'`) }),
  ));

  function makeSourcePath(relative: string) {
    return path.join(basePath, relative) + '/**/*';
  }
}
