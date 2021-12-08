// inspired from:
// - old tahoma plugin: https://github.com/mylife-home/mylife-home-core-plugins-hw-tahoma/blob/master/lib/service/connection.js
// - overkiz-client (using by homebridge-tahoma): https://github.com/dubocr/overkiz-client
// - overkiz-api (found on npm): https://github.com/bbriatte/overkiz-api

import https from 'https';
import { ClientRequest, IncomingMessage } from 'http';
import { EventEmitter } from 'events';
import { Mutex } from 'async-mutex';
import { logger } from 'mylife-home-common';
import { Device } from './api-types/device';
import { Execution } from './api-types/execution';
import { Event } from './api-types/event';

const log = logger.createLogger('mylife:home:core:plugins:driver-tahoma:engine:api');

// => refresh devices toutes les 30 mins
// => refresh events toutes les 2 secs
// => post de refresh states toutes les X secondes
// => si events OK, le getDevices ne devrait pas etre necessaire

export class HttpError extends Error {
  httpStatusCode: number;
}

export interface API extends EventEmitter {
  on(event: 'loggedChanged', listener: (logged: boolean) => void): this;
  off(event: 'loggedChanged', listener: (logged: boolean) => void): this;
  once(event: 'loggedChanged', listener: (logged: boolean) => void): this;
}

export class API extends EventEmitter {
  private readonly cookies = new Cookies();
  private _logged = false;
  private readonly loginMutex = new Mutex();

  constructor(private readonly user: string, private readonly password: string) {
    super();
  }

  get logged() {
    return this._logged;
  }

  private setLogged(newValue: boolean) {
    if (newValue !== this._logged) {
      log.debug(`setLogged ${newValue}`);
      this._logged = newValue;
      this.emit('loggedChanged', this._logged);
    }
  }

  async getDevices() {
    log.debug('getDevices');

    return await this.request('GET', '/setup/devices') as Device[];
  }

  async registerEvents() {
    log.debug('registerEvents');

    const response = await this.request('POST', '/events/register') as RegisterEventsResponse;
    return response.id;
  }

  async refreshStates() {
    log.debug('refreshStates');

    await this.request('PUT', '/setup/devices/states/refresh');
  }

  async fetchEvents(listenerId: string) {
    // Do not log them as they appear tooo often
    // log.debug('fetchEvents');

    return await this.request('POST', `/events/${listenerId}/fetch`) as Event[];
  }

  async execute(execution: Execution) {
    log.debug('execute');

    const response = await this.request('POST', '/exec/apply', execution) as ExecuteResponse;
    return response.execId;
  }

  async cancel(execId: string) {
    log.debug('cancel');

    await this.request('DELETE', `/exec/current/setup/${execId}`);
  }

  // Note: login create a new session each time (JSESSIONID is different)
  private async login(): Promise<void> {
    log.debug('login');

    const response = await this.rawRequest('POST', '/login', { userId: this.user, userPassword: this.password }, 'form') as LoginResponse;
    if (!response.success) {
      throw new Error('Login unsuccessful');
    }
  }

  private async request(method: string, query: string, data?: any, dataType: 'form' | 'json' = 'json') {
    return await this.loginMutex.runExclusive(async () => {
      while (true) {
        if (!this.logged) {
          await this.login();
        }

        this.setLogged(true);

        try {
          return await this.rawRequest(method, query, data, dataType);
        } catch (err) {
          if (err instanceof HttpError && (err as HttpError).httpStatusCode === 401) {
            // auth and retry
            log.error(err, 'Authentication failed');
            this.setLogged(false);
            continue;
          }

          throw err;
        }
      }
    });
  }

  private async rawRequest(method: string, query: string, data?: any, dataType: 'form' | 'json' = 'json'): Promise<any> {

    const responseData = await new Promise<Buffer>((resolve, reject) => {
      try {
        const url = `https://tahomalink.com/enduser-mobile-web/enduserAPI${query}`;
        const request = https.request(url, { method, timeout: 10000 }, (response) => {
          response.on('error', (err) => {
            reject(err);
          })

          this.cookies.readResponse(response);

          const data: Buffer[] = [];

          response.on('data', (chunk: Buffer) => {
            data.push(chunk);
          });

          response.on('end', () => {
            if (response.statusCode < 200 || response.statusCode >= 300) {
              let msg = `Got HTTP error (method='${method}', query='${query}'): ${response.statusCode}`;
              if (response.statusMessage) {
                msg = `${msg} - ${response.statusMessage}`;
              }

              const textData = Buffer.concat(data).toString();
              if (textData) {
                msg = `${msg} - ${textData}`;
              }

              const err = new HttpError(msg);
              err.httpStatusCode = response.statusCode;
              return reject(err);
            }

            resolve(Buffer.concat(data));
          });
        });

        request.on('error', (err) => {
          reject(err);
        });

        request.on('timeout', () => {
          request.destroy();
          reject(new Error(`Got HTTP timeout (method='${method}', query='${query}')`));
        });

        this.cookies.writeRequest(request);

        if (data) {
          switch (dataType) {
            case 'form': {
              const params = new URLSearchParams();
              for (const [key, value] of Object.entries(data)) {
                params.append(key, String(value));
              }

              request.setHeader('Content-Type', 'application/x-www-form-urlencoded');
              const requestData = Buffer.from(params.toString());
              request.write(requestData);
              break;
            }

            case 'json': {
              request.setHeader('Content-Type', 'application/json');
              const requestData = Buffer.from(JSON.stringify(data), 'utf8');
              request.write(requestData);
              break;
            }
          }
        }

        request.end();
      } catch (err) {
        reject(err);
      }
    });

    if (responseData.length === 0) {
      return; // No output
    } else {
      return JSON.parse(responseData.toString('utf8'));
    }
  }
}

interface LoginResponse {
  success: boolean;
  roles: { name: string; }[];
}

interface RegisterEventsResponse {
  id: string;
}

interface ExecuteResponse {
  execId: string;
}

// https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies
class Cookies {
  private readonly map = new Map<string, string>();

  readResponse(response: IncomingMessage) {
    const newCookies = response.headers['set-cookie'];
    if (!newCookies) {
      return;
    }

    for (const line of newCookies) {
      // ignore Path, Expire, ...
      const regex = /^([^=]+)=([^;]+)/g;
      const [, key, value] = regex.exec(line);
      this.map.set(key, value);
    }
  }

  writeRequest(request: ClientRequest) {
    if (this.map.size === 0) {
      return;
    }

    const parts: string[] = [];
    for (const [key, value] of this.map.entries()) {
      parts.push(`${key}=${value}`);
    }

    request.setHeader('cookie', parts.join('; '));
  }
}
