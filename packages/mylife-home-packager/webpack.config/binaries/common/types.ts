import { Configuration } from 'webpack';
import { Context } from '../../context';

export type ConfigurationFactory = (context: Context) => Configuration;
export type ConfigurationByMode = { [mode: string]: Configuration; };
