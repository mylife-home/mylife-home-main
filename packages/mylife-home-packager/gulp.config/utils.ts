import path from 'path';
import os from 'os';
import { promises as fs } from 'fs';
import { spawn } from 'child_process';
import { TaskFunction, series } from 'gulp';
import rm from 'rimraf';

export async function noop() {
}

export function name(displayName: string, task: TaskFunction): TaskFunction {
  task.displayName = displayName;
  return task;
}

export interface TempPathReference {
  path: string;
}

export function withTempPath(prefix: string, taskFactory: (tempPathRef: TempPathReference) => TaskFunction) {
  const tempPathRef: TempPathReference = { path: null };

  return series(
    name('create temp path', async () => {
      tempPathRef.path = await fs.mkdtemp(path.join(os.tmpdir(), prefix));
      console.log(`Use temp path: '${tempPathRef.path}'`);
    }),
    taskFactory(tempPathRef),
    name('cleanup', (cb) => rm(tempPathRef.path, cb))
  );
}

export function run(command: string, ...args: string[]) {
  return spawn(command, args, { stdio: ['ignore', 'ignore', 'inherit'] });
}