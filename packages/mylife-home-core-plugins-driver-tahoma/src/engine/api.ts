// inspired from:
// - old tahoma plugin: https://github.com/mylife-home/mylife-home-core-plugins-hw-tahoma/blob/master/lib/service/connection.js
// - overkiz-client (using by homebridge-tahoma): https://github.com/dubocr/overkiz-client
// - overkiz-api (found on npm): https://github.com/bbriatte/overkiz-api

import { ClientRequest, IncomingMessage } from 'http';
import https from 'https';

// => refresh devices toutes les 30 mins
// => refresh events toutes les 2 secs
// => post de refresh states toutes les X secondes
// => si events OK, le getDevices ne devrait pas etre necessaire

export class HttpError extends Error {
  httpStatusCode: number;
}

export class API {
  private readonly cookies = new Cookies();

  constructor(private readonly user: string, private readonly password: string) {
  }

  async login(): Promise<void> {
    const response = await this.request('POST', '/login', { userId: this.user, userPassword: this.password }, 'form') as LoginResponse;
    if (!response.success) {
      throw new Error('Login unsuccessful');
    }
  }

  async getDevices() {
    return await this.request('GET', '/setup/devices');
  }

  private async request(method: string, query: string, data?: any, dataType: 'form' | 'json' = 'json'): Promise<any> {

    const responseData = await new Promise<Buffer>((resolve, reject) => {
      try {
        const url = `https://tahomalink.com/enduser-mobile-web/enduserAPI${query}`;
        const request = https.request(url, { method }, (response) => {
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

    return JSON.parse(responseData.toString('utf8'));
  }
}

interface LoginResponse {
  success: boolean;
  roles: { name: string; }[];
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
