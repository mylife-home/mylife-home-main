import path from 'path';

export type Options = { [name: string]: any };
export type Mode = 'prod' | 'dev';

export interface Context {
  readonly basePath: string;
  readonly outputPath: string;
  readonly mode: Mode;
  readonly options: Options;
}

export function createContext(mode: Mode, options: Options = {}): Context {
  const basePath = path.resolve(__dirname, '..');
  const outputPath = path.resolve(__dirname, '..', 'dist', mode);
  return { basePath, outputPath, mode, options };
}
