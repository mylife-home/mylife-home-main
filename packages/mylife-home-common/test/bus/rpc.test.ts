import 'mocha';
import { expect } from 'chai';
import sinon from 'sinon';
import mqttServer from 'mqtt-server';
import { Transport } from '../../src/bus/transport';
import util from 'util';

const SERVER_URL = 'tcp://localhost:11883';
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

  let server: any;

  beforeEach('setup mqtt server', async () => {
    server = mqttServer({ mqtt: SERVER_URL });
    promisifyMethod(server, 'listen');
    promisifyMethod(server, 'close');
    promisifyMethod(server, 'destroy');

    await server.listenAsync();
  });

  afterEach('setup mqtt server', async () => {
    await server.closeAsync();
    await server.destroyAsync();
    server = null;
  });

}

function promisifyMethod(object: any, methodName: string) {
  object[methodName + 'Async'] = util.promisify(object[methodName].bind(object));
}