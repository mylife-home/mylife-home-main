import path from 'path';
import os from 'os';
import { promises as fs } from 'fs';
import { spawn } from 'child_process';
import { src, dest, series, parallel } from 'gulp';
import rm from 'rimraf';

export interface DockerTaskOptions {
  readonly config: string;
  readonly binaries: string;
  readonly imageTag: string;
}

export function createDockerTask(options: DockerTaskOptions) {
  const basePath = path.resolve(path.join(__dirname, '..'));
  let contextPath: string;

  return series(
    name('create context path', async () => {
      contextPath = await fs.mkdtemp(path.join(os.tmpdir(), 'docker-build-'));
      console.log(`update context path '${contextPath}'`);
    }),
    parallel(
      name('copy config', () => src([makeSourcePath(options.config), '!**/Dockerfile']).pipe(dest(contextPath))),
      name('copy binaries', () => src([makeSourcePath(options.binaries), '!**/*.report.html']).pipe(dest(contextPath)))
    ),
    name('docker build', () => runDocker(contextPath, path.join(basePath, options.config, 'Dockerfile'), options.imageTag)),
    name('summary', async () => { console.log(`create docker image: '${options.imageTag}'`) }),
    name('cleanup', (cb) => rm(contextPath, cb))
  );

  function makeSourcePath(relative: string) {
    return path.join(basePath, relative) + '/**/*';
  }
}

function name<Task>(displayName: string, task: Task): Task {
  Object.assign(task, { displayName });
  return task;
}

function runDocker(contextPath: string, dockerfilePath: string, imageTag: string) {
  return spawn('docker', ['build', '--no-cache', '-t', imageTag, '-f', dockerfilePath, contextPath], { stdio: [null, null, process.stderr] });
}