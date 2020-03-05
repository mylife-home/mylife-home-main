import 'mocha';
import { expect } from 'chai';
import sinon from 'sinon';
import * as encoding from '../../src/bus/encoding';
import { MqttTestSession, delayError, sleep } from './tools';

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

  it('should transmit action', async () => {
    const session = new MqttTestSession();
    await session.init();
    try {
      const server = await session.createTransport('server');
      const client = await session.createTransport('client');

      const local = server.components.addLocalComponent('test-component');
      const handler = sinon.fake();
      await local.registerAction('action', handler);

      const remote = client.components.trackRemoteComponent('server', 'test-component');
      await remote.emitAction('action', encoding.writeInt32(42));

      await sleep(20);

      expect(handler.calledOnce).to.be.true;
      expect(handler.lastCall.args[0]).to.deep.equal(encoding.writeInt32(42));

    } finally {
      await session.terminate();
    }
  });

  it('should transmit state', async () => {
    const session = new MqttTestSession();
    await session.init();
    try {
      const server = await session.createTransport('server');
      const client = await session.createTransport('client');

      const remote = client.components.trackRemoteComponent('server', 'test-component');
      const handler = sinon.fake();
      await remote.registerStateChange('state', handler);

      const local = server.components.addLocalComponent('test-component');
      await local.setState('state', encoding.writeInt32(42));

      await sleep(20);

      expect(handler.calledOnce).to.be.true;
      expect(handler.lastCall.args[0]).to.deep.equal(encoding.writeInt32(42));

    } finally {
      await session.terminate();
    }
  });

  it('should get state on registration', async () => {
    const session = new MqttTestSession();
    await session.init();
    try {
      const server = await session.createTransport('server');
      const client = await session.createTransport('client');

      const local = server.components.addLocalComponent('test-component');
      await local.setState('state', encoding.writeInt32(42));
      await sleep(20);

      // register after set state
      const remote = client.components.trackRemoteComponent('server', 'test-component');
      const handler = sinon.fake();
      await remote.registerStateChange('state', handler);
      await sleep(20);

      expect(handler.calledOnce).to.be.true;
      expect(handler.lastCall.args[0]).to.deep.equal(encoding.writeInt32(42));

    } finally {
      await session.terminate();
    }
  });


  it('should get state on registration even if server left', async () => {
    const session = new MqttTestSession();
    await session.init();
    try {
      const server = await session.createTransport('server');

      const local = server.components.addLocalComponent('test-component');
      await local.setState('state', encoding.writeInt32(42));
      await sleep(20);

      await session.closeTransport('server');
      await sleep(20);

      const client = await session.createTransport('client');

      const remote = client.components.trackRemoteComponent('server', 'test-component');
      const handler = sinon.fake();
      await remote.registerStateChange('state', handler);
      await sleep(20);

      expect(handler.calledOnce).to.be.true;
      expect(handler.lastCall.args[0]).to.deep.equal(encoding.writeInt32(42));

    } finally {
      await session.terminate();
    }
  });
});
