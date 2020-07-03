import path from 'path';

export type Environment = { [name: string]: string; };

export interface Context {
  readonly basePath: string;
  readonly outputPath: string;
  readonly env: Environment;
}

export function createContext(env: Environment): Context {
  const basePath = path.resolve(__dirname, '..');
  const outputPath = path.resolve(__dirname, '..', 'dist', env.mode)
  return { basePath, outputPath, env };
}
