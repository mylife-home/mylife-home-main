import 'mocha';
import { expect } from 'chai';
import sinon from 'sinon';
import * as encoding from '../../src/bus/encoding';
import { MqttTestSession, delayError } from './tools';

describe('bus/components', () => {
  it('should register and unregister local component', async () => {
    const session = new MqttTestSession();
    await session.init();
    try {

      const server = await session.createTransport('server');

      const component = server.components.addLocalComponent('test-component');
      await component.registerAction('action', () => { });
      await component.setState('state', encoding.writeBool(false));

      server.components.removeLocalComponent('test-component');

    } finally {
      await session.terminate();
    }
  });

  it('should fail to register local component twice', async () => {
    const session = new MqttTestSession();
    await session.init();
    try {
      const server = await session.createTransport('server');

      server.components.addLocalComponent('test-component');

      const fn = () => server.components.addLocalComponent('test-component');
      expect(fn).to.throw(`Component with id 'test-component' does already exist`);

    } finally {
      await session.terminate();
    }
  });

  it('should fail to register local action twice', async () => {
    const session = new MqttTestSession();
    await session.init();
    try {
      const server = await session.createTransport('server');

      const component = server.components.addLocalComponent('test-component');
      await component.registerAction('action', () => { });

      const fn = await delayError(() => component.registerAction('action', () => { }));
      expect(fn).to.throw(`Action 'action' does already exist on component 'test-component'`);

    } finally {
      await session.terminate();
    }
  });
  it('should register and unregister remote component', async () => {
    const session = new MqttTestSession();
    await session.init();
    try {

      const server = await session.createTransport('server');

      const component = server.components.trackRemoteComponent('other', 'test-component');
      await component.registerStateChange('state', () => { });
      await component.emitAction('action', encoding.writeBool(false));

      server.components.untrackRemoteComponent(component);

    } finally {
      await session.terminate();
    }
  });

  it('should register remote component twice', async () => {
    const session = new MqttTestSession();
    await session.init();
    try {
      const server = await session.createTransport('server');

      server.components.trackRemoteComponent('other', 'test-component');
      server.components.trackRemoteComponent('other', 'test-component');

    } finally {
      await session.terminate();
    }
  });

  it('should fail to register remote state change twice', async () => {
    const session = new MqttTestSession();
    await session.init();
    try {
      const server = await session.createTransport('server');

      const component = server.components.trackRemoteComponent('other', 'test-component');
      await component.registerStateChange('state', () => { });

      const fn = await delayError(() => component.registerStateChange('state', () => { }));
      expect(fn).to.throw(`State 'state' already registered for changes on component 'test-component'`);

    } finally {
      await session.terminate();
    }
  });
  /*
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
      } 
    });
  
    it('should be able to register rpc server while offline', async () => {
      const session = new MqttTestSession();
      await session.init();
      try {
  
        const client = await session.createTransport('client');
        const server = await session.createTransport('server');
  
        await session.disconnectTransport('server');
        const serverImpl = sinon.fake.returns({ type: 'response' });
        await server.rpc.serve(RPC_ADDRESS, serverImpl);
        await session.reconnectTransport('server');
  
        const result = await client.rpc.call('server', RPC_ADDRESS, { type: 'request'});
  
        expect(result).to.deep.equal({ type: 'response' });
        expect(serverImpl.calledOnce).to.be.true;
        expect(serverImpl.firstCall.args[0]).to.deep.equal({ type: 'request'});
  
      } finally {
        await session.terminate();
      }
    });
    */
});
