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

  it('should fail to register service twice', async () => {
    const session = new MqttTestSession();
    await session.init();
    try {
      const server = await session.createTransport('server');

      const serverImpl1 = (data:any): any => {};
      const serverImpl2 = (data:any): any => {};
      await server.rpc.serve(RPC_ADDRESS, serverImpl1);
      const fn = await delayError(() => server.rpc.serve(RPC_ADDRESS, serverImpl2));
      expect(fn).to.throw(`Service with address '${RPC_ADDRESS}' does already exist`);

    } finally {
      await session.terminate();
    }
  });

  it('should not mismatch while using multiple RPC channels', async () => {
  });

  it('should not mismatch while having multiple RPC clients', async () => {
  });
});

async function delayError(target: () => Promise<void>): Promise<() => void> {
  try {
    await target();
  } catch(err) {
    return () => {
      throw err;
    }
  }

  return () => {};
}