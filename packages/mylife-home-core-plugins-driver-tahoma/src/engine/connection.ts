// inspired from:
// - old tahoma plugin: https://github.com/mylife-home/mylife-home-core-plugins-hw-tahoma/blob/master/lib/service/connection.js
// - overkiz-client (using by homebridge-tahoma): https://github.com/dubocr/overkiz-client
// - overkiz-api (found on npm): https://github.com/bbriatte/overkiz-api

import https, { RequestOptions } from 'https';

export class HttpError extends Error {
  httpStatusCode: number;
}

export class Connection {
  private logged = false;

  constructor(private readonly user: string, private readonly password: string) {

  }

  async request(method: string, query: string, data?: any): Promise<any> {

    const responseData = await new Promise<Buffer>((resolve, reject) => {
      try {
        const url = `https://tahomalink.com/enduser-mobile-web/enduserAPI${query}`;
        const request = https.request(url, { method }, (response) => {

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

        if (data) {
          const requestData = Buffer.from(JSON.stringify(data), 'utf8');
          request.setHeader('Content-Type', 'application/json');
          request.setHeader('Content-Length', requestData.length);
          request.write(requestData);
        }

        request.end();
      } catch (err) {
        reject(err);
      }
    });

    return JSON.parse(responseData.toString('utf8'));
  }
}

// => refresh devices toutes les 30 mins
// => refresh events toutes les 2 secs
// => post de refresh states toutes les X secondes
// => si events OK, le getDevices ne devrait pas etre necessaire
