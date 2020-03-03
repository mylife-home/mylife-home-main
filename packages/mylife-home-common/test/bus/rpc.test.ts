import net from 'net';
import util from 'util';
import 'mocha';
import { expect } from 'chai';
import sinon from 'sinon';
import aedes, { Server } from 'aedes';
import { Transport } from '../../src/bus/transport';

const SERVER_PORT = 11883;
const SERVER_URL = `tcp://localhost:${SERVER_PORT}`;
const RPC_ADDRESS = 'testRpc';

describe('bus/rpc', () => {
  setupMqttServer();

  it('should call rpc server', async () => {
    const client = new Transport('client', SERVER_URL);
    const server = new Transport('server', SERVER_URL);
    try {
      const REQUEST = { foo: 'bar' };
      const RESPONSE = { foo: 'baz' };

      const serverImpl = sinon.fake.returns(RESPONSE);

      server.rpc.serve(RPC_ADDRESS, serverImpl);

      const result = await client.rpc.call('server', RPC_ADDRESS, REQUEST);

      expect(result).to.deep.equal(RESPONSE);
      expect(serverImpl.calledOnce).to.be.true;
      expect(serverImpl.firstCall.args[0]).to.deep.equal(REQUEST);

    } finally {
      await client.terminate();
      await server.terminate();
    }
  });
});

function setupMqttServer() {

  let server: net.Server;
  let aedesServer: aedes.Aedes;

  beforeEach('setup mqtt server', async () => {
    aedesServer = aedes.Server();
    server = net.createServer(aedesServer.handle);
    await new Promise(resolve => server.listen(SERVER_PORT, resolve));
  });

  afterEach('setup mqtt server', async () => {
    await new Promise(resolve => aedesServer.close(resolve));
    await new Promise(resolve => server.close(resolve));
  });
}
