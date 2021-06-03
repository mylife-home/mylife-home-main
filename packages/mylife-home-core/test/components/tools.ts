import net from 'net';
import aedes from 'aedes';
import { bus, tools } from 'mylife-home-common';

import Transport = bus.Transport;
import TransportOptions = bus.TransportOptions;

const SERVER_PORT = 11883;
const PROXY_PORT_START = 11884;

class Proxy {
  private static nextServerPort = PROXY_PORT_START;
  public readonly serverPort = Proxy.nextServerPort++;
  private _running: boolean = false;

  private listenSocket: net.Server;
  private serverSocket: net.Socket;
  private clientSocket: net.Socket;

  constructor(private readonly targetPort: number, private readonly targetHost: string = 'localhost') {}

  get running() {
    return this._running;
  }

  stop() {
    if (this.clientSocket) {
      this.clientSocket.removeAllListeners();
      this.clientSocket.destroy();
      this.clientSocket = null;
    }
    if (this.serverSocket) {
      this.serverSocket.removeAllListeners();
      this.serverSocket.destroy();
      this.serverSocket = null;
    }
    if (this.listenSocket) {
      this.listenSocket.removeAllListeners();
      this.listenSocket.close();
      this.listenSocket = null;
    }
  }

  start() {
    this.listenSocket = net.createServer((socket) => {
      this.listenSocket.close();
      this.listenSocket = null;

      this.serverSocket = socket;
      this.clientSocket = net.connect(this.targetPort, this.targetHost);

      this.clientSocket.on('end', () => this.reset());
      this.serverSocket.on('end', () => this.reset());
      this.clientSocket.on('close', () => this.reset());
      this.serverSocket.on('close', () => this.reset());

      this.clientSocket.on('error', (err) => console.error('clientSocket', err));
      this.serverSocket.on('error', (err) => console.error('serverSocket', err));

      this.clientSocket.on('data', (data) => this.serverSocket.write(data));
      this.serverSocket.on('data', (data) => this.clientSocket.write(data));
    });

    this.listenSocket.listen(this.serverPort);
  }

  private reset() {
    this.stop();
    this.start();
  }
}

class TransportData {
  constructor(public readonly transport: Transport, public readonly proxy: Proxy) {}
}

export class MqttTestSession {
  private server: net.Server;
  private aedesServer: aedes.Aedes;
  private readonly transports = new Map<string, TransportData>();

  async init() {
    this.aedesServer = aedes.Server();
    this.server = net.createServer(this.aedesServer.handle);
    await new Promise<void>((resolve) => this.server.listen(SERVER_PORT, resolve));
  }

  async terminate() {
    for (const transport of this.transports.keys()) {
      await this.closeTransport(transport);
    }

    await new Promise<void>((resolve) => this.aedesServer.close(resolve));
    await new Promise<void>((resolve) => this.server.close(() => resolve()));
    this.server = null;
    this.aedesServer = null;
  }

  async createTransport(instanceName: string, options?: TransportOptions) {
    const proxy = new Proxy(SERVER_PORT);
    proxy.start();

    options = options || {};
    if (!options.residentStateDelay) {
      // reduce delay for tests
      options.residentStateDelay = 10;
    }

    tools.injectConfig({ bus: { serverUrl: `tcp://localhost:${proxy.serverPort}` } });
    tools.setDefine('instance-name', instanceName);
    const transport = new Transport(options);
    await waitForConnected(transport);

    this.transports.set(instanceName, new TransportData(transport, proxy));
    return transport;
  }

  async closeTransport(instanceName: string): Promise<void> {
    const transportData = this.transports.get(instanceName);
    await transportData.transport.terminate();
    transportData.proxy.stop();
    this.transports.delete(instanceName);
  }

  async disconnectTransport(instanceName: string) {
    const transportData = this.transports.get(instanceName);
    transportData.proxy.stop();
    await waitForDisconnected(transportData.transport);
  }

  async reconnectTransport(instanceName: string) {
    const transportData = this.transports.get(instanceName);
    transportData.proxy.start();
    await waitForConnected(transportData.transport);
  }
}

async function waitForConnected(transport: Transport) {
  return new Promise<void>((resolve, reject) => {
    if (transport.online) {
      resolve();
      return;
    }

    const onEnd = () => {
      transport.off('onlineChange', onOnlineChange);
      transport.off('error', onError);
    };

    const onError = (err: Error) => {
      onEnd();
      reject(err);
    };

    const onOnlineChange = (value: boolean) => {
      if (!value) {
        return;
      }

      onEnd();
      resolve();
    };

    transport.on('onlineChange', onOnlineChange);
    transport.on('error', onError);
  });
}

async function waitForDisconnected(transport: Transport) {
  return new Promise<void>((resolve, reject) => {
    if (!transport.online) {
      resolve();
      return;
    }

    const onOnlineChange = (value: boolean) => {
      if (value) {
        return;
      }

      transport.off('onlineChange', onOnlineChange);
      resolve();
    };

    transport.on('onlineChange', onOnlineChange);
  });
}

export async function delayError(target: () => Promise<void>): Promise<() => void> {
  try {
    await target();
  } catch (err) {
    return () => {
      throw err;
    };
  }

  return () => {};
}
