import { Configuration } from 'webpack';

export interface Paths {
  readonly base: string;
  readonly output: string;
}

export type Environment = { [name: string]: string; };
export type ConfigurationFactory = (env: Environment) => Configuration;

export type ConfigurationByMode = { [mode: string]: Configuration; };