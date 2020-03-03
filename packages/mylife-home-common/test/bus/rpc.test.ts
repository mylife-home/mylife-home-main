import net from 'net';
import util from 'util';
import 'mocha';
import { expect } from 'chai';
import sinon from 'sinon';
import aedes from 'aedes';
import { Transport } from '../../src/bus/transport';

const SERVER_PORT = 11883;
const SERVER_URL = `tcp://localhost:${SERVER_PORT}`;
const RPC_ADDRESS = 'testRpc';

describe('bus/rpc', () => {
  setupMqttServer();

  it('should call rpc server', async () => {
    const client = new Transport('client', SERVER_URL);
    const server = new Transport('server', SERVER_URL);

    const REQUEST = { foo: 'bar' };
    const RESPONSE = { foo: 'baz' };

    const serverImpl = sinon.fake.returns(RESPONSE);

    server.rpc.serve(RPC_ADDRESS, serverImpl);

    const result = await client.rpc.call('server', RPC_ADDRESS, REQUEST);

    expect(result).to.deep.equal(RESPONSE);
    expect(serverImpl.calledOnce).to.be.true;
    expect(serverImpl.firstCall.args[0]).to.deep.equal(REQUEST);
  });
});

function setupMqttServer() {

  let destroy: () => Promise<void>;

  beforeEach('setup mqtt server', async () => {
    const aedesServer = aedes.Server();
    const server = net.createServer(aedesServer.handle);
    destroy = createDestroy(server);
    await new Promise(resolve => server.listen(SERVER_PORT, resolve));
  });

  afterEach('setup mqtt server', destroy);
}

function createDestroy(server: net.Server): () => Promise<void> {
  const connections = new Set<net.Socket>();

  server.on('connection', conn => {
    connections.add(conn);
    conn.on('close', () => connections.delete(conn));
  });

  return async () => {
    for (const conn of connections) {
      conn.destroy();
    }
    await new Promise((resolve, reject) => server.close((err) => err ? reject() : resolve()));
  }
}