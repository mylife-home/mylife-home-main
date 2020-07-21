import * as mqtt from 'async-mqtt';

const COLORS = {
  Reset: '\x1b[0m',
  Bright: '\x1b[1m',
  Dim: '\x1b[2m',
  Underscore: '\x1b[4m',
  Blink: '\x1b[5m',
  Reverse: '\x1b[7m',
  Hidden: '\x1b[8m',

  FgBlack: '\x1b[30m',
  FgRed: '\x1b[31m',
  FgGreen: '\x1b[32m',
  FgYellow: '\x1b[33m',
  FgBlue: '\x1b[34m',
  FgMagenta: '\x1b[35m',
  FgCyan: '\x1b[36m',
  FgWhite: '\x1b[37m',

  BgBlack: '\x1b[40m',
  BgRed: '\x1b[41m',
  BgGreen: '\x1b[42m',
  BgYellow: '\x1b[43m',
  BgBlue: '\x1b[44m',
  BgMagenta: '\x1b[45m',
  BgCyan: '\x1b[46m',
  BgWhite: '\x1b[47m',
};

export class Logger {

  private readonly client: mqtt.AsyncClient;

  constructor(serverUrl: string) {
    this.client = mqtt.connect(serverUrl, { resubscribe: false });
    fireAsync(() => this.client.subscribe('#'));
    this.client.on('connect', this.onConnect);
    this.client.on('error', this.onError);
    this.client.on('message', this.onMessage);
  }

  terminate() {
    fireAsync(() => this.client.end(true));
  }

  private readonly onConnect = () => {
    print('CONNECT');
  };

  private readonly onError = (error: Error) => {
    print('ERROR', error.stack);
  };

  private readonly onMessage = (topic: string, payload: Buffer) => {
    print('MESSAGE', `topic='${topic}', payload='${bufferToString(payload)}'`);
  };
}

function bufferToString(buffer: Buffer) {
  const hex =  buffer.length <= 8;
  return buffer.toString(hex ? 'hex' : 'utf8');
}

function print(title: string, message: string = '') {
  console.log(COLORS.FgBlue + title + COLORS.Reset + ' ' + message);
}

function fireAsync<T>(target: () => Promise<T>): void {
  target().catch((err) => console.error(err, 'Error on fireAsync'));
}
