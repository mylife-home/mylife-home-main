import path from 'path';
import os from 'os';
import { promises as fs } from 'fs';
import { TaskFunction, series } from 'gulp';
import rm from 'rimraf';

export async function noop() {
}

export function name(displayName: string, task: TaskFunction): TaskFunction {
  task.displayName = displayName;
  return task;
}

export function withTempPath(prefix: string, taskFactory: (tempPath: string) => TaskFunction) {
  let tempPath: string;

  return series(
    name('create context path', async () => {
      tempPath = await fs.mkdtemp(path.join(os.tmpdir(), prefix));
      console.log(`Use temp path: '${tempPath}'`);
    }),
    taskFactory(tempPath),
    name('cleanup', (cb) => rm(tempPath, cb))
  );
}