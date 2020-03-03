import net from 'net';
import aedes from 'aedes';
import { Transport } from '../../src/bus/transport';

const SERVER_PORT = 11883;
const SERVER_URL = `tcp://localhost:${SERVER_PORT}`;

export class MqttTestSession {
  private server: net.Server;
  private aedesServer: aedes.Aedes;
  private readonly transports = new Set<Transport>();

  async init() {
    this.aedesServer = aedes.Server();
    this.server = net.createServer(this.aedesServer.handle);
    await new Promise(resolve => this.server.listen(SERVER_PORT, resolve));
  }

  async terminate() {
    for(const transport of this.transports) {
      await transport.terminate();
    }
    this.transports.clear();

    await new Promise(resolve => this.aedesServer.close(resolve));
    await new Promise(resolve => this.server.close(resolve));
    this.server = null;
    this.aedesServer = null;
  }

  async createTransport(instanceName: string) {
    const transport = new Transport(instanceName, SERVER_URL);
    await waitForConnected(transport);
    this.transports.add(transport);
    return transport;
  }
}

export async function waitForConnected(transport: Transport) {
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