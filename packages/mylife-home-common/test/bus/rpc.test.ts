import 'mocha';
import { expect } from 'chai';
import sinon from 'sinon';
import { MqttTestSession } from './tools';

const RPC_ADDRESS = 'testRpc';
const RPC_ADDRESS2 = 'testRpc2';

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

      const serverImpl1 = (data: any): any => { };
      const serverImpl2 = (data: any): any => { };
      await server.rpc.serve(RPC_ADDRESS, serverImpl1);
      const fn = await delayError(() => server.rpc.serve(RPC_ADDRESS, serverImpl2));
      expect(fn).to.throw(`Service with address '${RPC_ADDRESS}' does already exist`);

    } finally {
      await session.terminate();
    }
  });

  it('should not mismatch while using multiple RPC channels', async () => {
    const session = new MqttTestSession();
    await session.init();
    try {

      const client = await session.createTransport('client');
      const server = await session.createTransport('server');

      const serverImpl1 = sinon.fake.returns({ type: 'response', channel: RPC_ADDRESS });
      const serverImpl2 = sinon.fake.returns({ type: 'response', channel: RPC_ADDRESS2 });

      await server.rpc.serve(RPC_ADDRESS, serverImpl1);
      await server.rpc.serve(RPC_ADDRESS2, serverImpl2);

      const [result1, result2] = await Promise.all([
        client.rpc.call('server', RPC_ADDRESS, { type: 'request', channel: RPC_ADDRESS }),
        client.rpc.call('server', RPC_ADDRESS2, { type: 'request', channel: RPC_ADDRESS2 })
      ]);

      expect(result1).to.deep.equal({ type: 'response', channel: RPC_ADDRESS });
      expect(serverImpl1.calledOnce).to.be.true;
      expect(serverImpl1.firstCall.args[0]).to.deep.equal({ type: 'request', channel: RPC_ADDRESS });

      expect(result2).to.deep.equal({ type: 'response', channel: RPC_ADDRESS2 });
      expect(serverImpl2.calledOnce).to.be.true;
      expect(serverImpl2.firstCall.args[0]).to.deep.equal({ type: 'request', channel: RPC_ADDRESS2 });

    } finally {
      await session.terminate();
    }
  });

  it('should not mismatch while having multiple RPC clients', async () => {
    const session = new MqttTestSession();
    await session.init();
    try {

      const client1 = await session.createTransport('client1');
      const client2 = await session.createTransport('client2');
      const server = await session.createTransport('server');

      const serverImpl = sinon.fake.returns({ type: 'response' });

      await server.rpc.serve(RPC_ADDRESS, serverImpl);

      const [result1, result2] = await Promise.all([
        client1.rpc.call('server', RPC_ADDRESS, { type: 'request' }),
        client2.rpc.call('server', RPC_ADDRESS, { type: 'request' })
      ]);

      expect(result1).to.deep.equal({ type: 'response' });
      expect(result2).to.deep.equal({ type: 'response' });

      const calls = serverImpl.getCalls();
      expect(calls.length).to.equal(2);
      expect(calls[0].args[0]).to.deep.equal({ type: 'request' });
      expect(calls[1].args[0]).to.deep.equal({ type: 'request' });

    } finally {
      await session.terminate();
    }  });
});

async function delayError(target: () => Promise<void>): Promise<() => void> {
  try {
    await target();
  } catch (err) {
    return () => {
      throw err;
    };
  }

  return () => { };
}