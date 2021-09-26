// Wrapper around overkiz-client to improve typing

import { Client } from 'overkiz-client';
import { logger } from 'mylife-home-common';

const log = logger.createLogger('mylife:home:core:plugins:driver-tahoma:engine:client');

// Wrap calls: it logger's last argument is the error if any; other arguments are concatenated
function rewriteArguments(args: any[]) {
  const strings: string[] = [];
  let error: Error;

  for (const arg of args) {
    if(arg instanceof Error) {
      error = arg;
    } else {
      strings.push(arg as string);
    }
  }

  const msg = strings.join(' ');
  return error ? [error, msg] : [msg];
}

const apiLogger = {
  debug(...args: any[]) {
    log.debug.apply(log, rewriteArguments(args));
  },
  info(...args: any[]) {
    log.info.apply(log, rewriteArguments(args));
  },
  warn(...args: any[]) {
    log.warn.apply(log, rewriteArguments(args));
  },
  error(...args: any[]) {
    log.error.apply(log, rewriteArguments(args));
  },
}

const client = new Client();
client.execute()

export interface Config {
  /**
   * Poll for execution events every 5 seconds by default (in seconds)
   */ 
  readonly execPollingPeriod: number; 

  /**
   * // Poll for events every 60 seconds by default (in seconds)
   */
   readonly pollingPeriod: number;

   /**
    * Refresh device states every 30 minutes by default (in minutes)
    */
   readonly refreshPeriod: number;

  /**
   * default: tahoma
   */
  readonly service: string;

  readonly user: string;
  readonly password: string;
}
