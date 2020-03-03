import 'mocha';
import { expect } from 'chai';
import sinon from 'sinon';
import { MqttTestSession } from './tools';

const RPC_ADDRESS = 'testRpc';

describe('bus/rpc', () => {
  it('should call rpc server', async () => {
    const session = new MqttTestSession();
    await session.init();
    try {

      const client = await session.createTransport('client');
      const server = await session.createTransport('server');

      const REQUEST = { foo: 'bar' };
      const RESPONSE = { foo: 'baz' };

      const serverImpl = sinon.fake.returns(RESPONSE);

      await server.rpc.serve(RPC_ADDRESS, serverImpl);

      const result = await client.rpc.call('server', RPC_ADDRESS, REQUEST);

      expect(result).to.deep.equal(RESPONSE);
      expect(serverImpl.calledOnce).to.be.true;
      expect(serverImpl.firstCall.args[0]).to.deep.equal(REQUEST);

    } finally {
      await session.terminate();
    }
  });
});
