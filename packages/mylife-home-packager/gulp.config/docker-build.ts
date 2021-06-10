import path from 'path';
import { spawn } from 'child_process';
import { src, dest, series, parallel } from 'gulp';
import { noop, name, withTempPath } from './utils';

export interface DockerTaskOptions {
  readonly config: string;
  readonly binaries: string;
  readonly imageTag: string;
  readonly publish?: boolean;
}

export function createDockerTask(options: DockerTaskOptions) {
  const basePath = path.resolve(path.join(__dirname, '..'));

  return withTempPath('docker-build-', contextPath => series(
    parallel(
      name('copy config', () => src([makeSourcePath(options.config), '!**/Dockerfile']).pipe(dest(contextPath))),
      name('copy binaries', () => src([makeSourcePath(options.binaries), '!**/*.report.html']).pipe(dest(contextPath)))
    ),
    name('docker build', () => runDockerBuild(contextPath, path.join(basePath, options.config, 'Dockerfile'), options.imageTag)),
    options.publish ? name('docker push', () => runDockerPublish(options.imageTag)) : noop,
    name('summary', async () => { console.log(`create docker image: '${options.imageTag}'`) }),
  ));

  function makeSourcePath(relative: string) {
    return path.join(basePath, relative) + '/**/*';
  }
}

function runDockerBuild(contextPath: string, dockerfilePath: string, imageTag: string) {
  return spawn('docker', ['build', '--no-cache', '-t', imageTag, '-f', dockerfilePath, contextPath], { stdio: [null, null, process.stderr] });
}

function runDockerPublish(imageTag: string) {
  return spawn('docker', ['push', imageTag], { stdio: [null, null, process.stderr] });
}
