import { EventEmitter } from 'events';
import 'mocha';
import { expect } from 'chai';
import sinon from 'sinon';
import { MqttTestSession, delayError, sleep } from '../bus/tools';
import { Registry, metadata, Component } from '../../src/components';

const TEST_PLUGIN: metadata.Plugin = Object.freeze({
  id: 'module.name',
  name: 'name',
  module: 'module',
  usage: metadata.PluginUsage.LOGIC,
  version: '1.0.0',
  description: 'My plugin',
  members: {
    myAction: { description: 'My action', memberType: metadata.MemberType.ACTION, valueType: new metadata.Bool() },
    myState: { description: 'My state', memberType: metadata.MemberType.STATE, valueType: new metadata.Bool() },
  },
  config: {
    myConf: { description: 'My conf', valueType: metadata.ConfigType.FLOAT }
  }
});

class TestComponent extends EventEmitter implements Component {
  constructor(public readonly id: string, public readonly plugin: metadata.Plugin = TEST_PLUGIN) {
    super();
  }

  executeAction(name: string, value: any): void {
    throw new Error('Method not implemented.');
  }

  getState(name: string) {
    throw new Error('Method not implemented.');
  }

  getStates(): { [name: string]: any; } {
    throw new Error('Method not implemented.');
  }

}

describe('components/registry', () => {
  it('should add plugin', () => {
    const registry = new Registry();

    const onPluginAdd = sinon.fake();
    const onOther = sinon.fake();
    registry.on('plugin.add', onPluginAdd);
    registry.on('plugin.remove', onOther);
    registry.on('component.add', onOther);
    registry.on('component.remove', onOther);

    registry.addPlugin('my-instance', TEST_PLUGIN);

    expect(onPluginAdd.calledOnceWithExactly('my-instance', TEST_PLUGIN)).to.be.true;
    expect(onOther.notCalled).to.be.true;
    expect(registry.getPlugin('my-instance', 'module.name')).to.equal(TEST_PLUGIN);
    expect(Array.from(registry.getPlugins('my-instance'))).to.deep.equal([TEST_PLUGIN]);
    expect(Array.from(registry.getInstanceNames())).to.deep.equal(['my-instance']);
  });

  it('should remove plugin', () => {
    const registry = new Registry();
    registry.addPlugin('my-instance', TEST_PLUGIN);

    const onPluginRemove = sinon.fake();
    const onOther = sinon.fake();
    registry.on('plugin.add', onOther);
    registry.on('plugin.remove', onPluginRemove);
    registry.on('component.add', onOther);
    registry.on('component.remove', onOther);

    registry.removePlugin('my-instance', TEST_PLUGIN);

    expect(onPluginRemove.calledOnceWithExactly('my-instance', TEST_PLUGIN)).to.be.true;
    expect(onOther.notCalled).to.be.true;
    expect(() => registry.getPlugin('my-instance', 'module.name')).to.throw('Plugin my-instance:module.name does not exist in the registry');
    expect(Array.from(registry.getPlugins('my-instance'))).to.deep.equal([]);
    expect(Array.from(registry.getInstanceNames())).to.deep.equal([]);
  });

  it('should add component', () => {
    const registry = new Registry();
    registry.addPlugin('my-instance', TEST_PLUGIN);
    const testComponent = new TestComponent('my-component');

    const onComponentAdd = sinon.fake();
    const onOther = sinon.fake();
    registry.on('plugin.add', onOther);
    registry.on('plugin.remove', onOther);
    registry.on('component.add', onComponentAdd);
    registry.on('component.remove', onOther);

    registry.addComponent('my-instance', testComponent);

    expect(onComponentAdd.calledOnceWithExactly('my-instance', testComponent)).to.be.true;
    expect(onOther.notCalled).to.be.true;
    expect(registry.getComponent('my-instance', 'my-component')).to.equal(testComponent);
    expect(Array.from(registry.getComponents('my-instance'))).to.deep.equal([testComponent]);
    expect(Array.from(registry.getInstanceNames())).to.deep.equal(['my-instance']);
  });

  it('should remove component', () => {
    const registry = new Registry();
    registry.addPlugin('my-instance', TEST_PLUGIN);
    const testComponent = new TestComponent('my-component');
    registry.addComponent('my-instance', testComponent);

    const onComponentRemove = sinon.fake();
    const onOther = sinon.fake();
    registry.on('plugin.add', onOther);
    registry.on('plugin.remove', onOther);
    registry.on('component.add', onOther);
    registry.on('component.remove', onComponentRemove);

    registry.removeComponent('my-instance', testComponent);

    expect(onComponentRemove.calledOnceWithExactly('my-instance', testComponent)).to.be.true;
    expect(onOther.notCalled).to.be.true;
    expect(() => registry.getComponent('my-instance', 'my-component')).to.throw('Component my-instance:my-component does not exist in the registry');
    expect(Array.from(registry.getComponents('my-instance'))).to.deep.equal([]);
    expect(Array.from(registry.getInstanceNames())).to.deep.equal(['my-instance']); // we still have the plugin
  });

  describe('bus-publisher', () => {
    it('should publish remote plugin', async () => {
      const session = new MqttTestSession();
      await session.init();
      try {
        const registryTransport = await session.createTransport('registry', { presenceTracking: true });
        const remoteTransport = await session.createTransport('remote');
        const registry = new Registry({ transport: registryTransport, publishRemoteComponent: true });
        await sleep(20);

        expect(Array.from(registry.getInstanceNames())).to.deep.equal([]);

        await remoteTransport.metadata.set(`plugins/${TEST_PLUGIN.id}`, metadata.encodePlugin(TEST_PLUGIN));
        await sleep(20);

        expect(registry.getPlugin('remote', 'module.name')).to.deep.equal(TEST_PLUGIN);
        expect(Array.from(registry.getPlugins('remote'))).to.deep.equal([TEST_PLUGIN]);
        expect(Array.from(registry.getInstanceNames())).to.deep.equal(['remote']);

        await remoteTransport.metadata.clear(`plugins/${TEST_PLUGIN.id}`);
        await sleep(20);

        expect(() => registry.getPlugin('remote', 'module.name')).to.throw('Plugin remote:module.name does not exist in the registry');
        expect(Array.from(registry.getPlugins('remote'))).to.deep.equal([]);
        expect(Array.from(registry.getInstanceNames())).to.deep.equal([]);

      } finally {
        await session.terminate();
      }
    });

    it('should publish remote component', async () => {
      const session = new MqttTestSession();
      await session.init();
      try {
        const registryTransport = await session.createTransport('registry', { presenceTracking: true });
        const remoteTransport = await session.createTransport('remote');
        const registry = new Registry({ transport: registryTransport, publishRemoteComponent: true });
        const boolType = new metadata.Bool();

        await remoteTransport.metadata.set(`plugins/${TEST_PLUGIN.id}`, metadata.encodePlugin(TEST_PLUGIN));
        await sleep(20);

        expect(Array.from(registry.getComponents('my-instance'))).to.deep.equal([]);

        // must publish component runtime before its meta
        const remoteComponent = remoteTransport.components.addLocalComponent('my-component');
        await remoteComponent.setState('myState', boolType.primitive.encode(false));
        await remoteTransport.metadata.set('components/my-component', { id: 'my-component', plugin: TEST_PLUGIN.id });
        await sleep(20);

        const plugin = registry.getPlugin('remote', 'module.name');
        const busComponent = registry.getComponent('remote', 'my-component');
        expect(busComponent.id).to.equal('my-component');
        expect(busComponent.plugin).to.equal(plugin);
        expect(Array.from(registry.getComponents('remote'))).to.deep.equal([busComponent]);
        expect(Array.from(registry.getInstanceNames())).to.deep.equal(['remote']);

        // must unpublish component runtime after its meta
        await remoteTransport.metadata.clear('components/my-component');
        await remoteTransport.components.removeLocalComponent('my-component');
        await sleep(50);

        expect(() => registry.getComponent('remote', 'my-component')).to.throw('Component remote:my-component does not exist in the registry');
        expect(Array.from(registry.getComponents('remote'))).to.deep.equal([]);

      } finally {
        await session.terminate();
      }
    });

    it('should transmit state updates from remote component', async () => {
      const session = new MqttTestSession();
      await session.init();
      try {
        const registryTransport = await session.createTransport('registry', { presenceTracking: true });
        const remoteTransport = await session.createTransport('remote');
        const registry = new Registry({ transport: registryTransport, publishRemoteComponent: true });
        const boolType = new metadata.Bool();

        await remoteTransport.metadata.set(`plugins/${TEST_PLUGIN.id}`, metadata.encodePlugin(TEST_PLUGIN));
        const remoteComponent = remoteTransport.components.addLocalComponent('my-component');
        await remoteComponent.setState('myState', boolType.primitive.encode(false));
        await remoteTransport.metadata.set('components/my-component', { id: 'my-component', plugin: TEST_PLUGIN.id });
        await sleep(20);

        const busComponent = registry.getComponent('remote', 'my-component');
        const onChange = sinon.fake();
        busComponent.on('state', onChange);

        expect(busComponent.getState('myState')).to.equal(false);
        expect(busComponent.getStates()).to.deep.equal({ myState: false });

        await remoteComponent.setState('myState', boolType.primitive.encode(true));
        await sleep(20);

        expect(busComponent.getState('myState')).to.equal(true);
        expect(busComponent.getStates()).to.deep.equal({ myState: true });
        expect(onChange.calledOnceWithExactly('myState', true)).to.be.true;

      } finally {
        await session.terminate();
      }
    });

    it('should transmit action to remote component', async () => {
      const session = new MqttTestSession();
      await session.init();
      try {
        const registryTransport = await session.createTransport('registry', { presenceTracking: true });
        const remoteTransport = await session.createTransport('remote');
        const registry = new Registry({ transport: registryTransport, publishRemoteComponent: true });
        const boolType = new metadata.Bool();

        await remoteTransport.metadata.set(`plugins/${TEST_PLUGIN.id}`, metadata.encodePlugin(TEST_PLUGIN));
        const remoteComponent = remoteTransport.components.addLocalComponent('my-component');
        await remoteTransport.metadata.set('components/my-component', { id: 'my-component', plugin: TEST_PLUGIN.id });
        const onAction = sinon.fake();
        await remoteComponent.registerAction('myAction', onAction);
        await sleep(20);

        const busComponent = registry.getComponent('remote', 'my-component');
        busComponent.executeAction('myAction', true);
        await sleep(20);

        expect(onAction.calledOnceWithExactly(boolType.primitive.encode(true))).to.be.true;

      } finally {
        await session.terminate();
      }
    });

    it('should fail to transmit bad action to remote component', async () => {
      const session = new MqttTestSession();
      await session.init();
      try {
        const registryTransport = await session.createTransport('registry', { presenceTracking: true });
        const remoteTransport = await session.createTransport('remote');
        const registry = new Registry({ transport: registryTransport, publishRemoteComponent: true });

        await remoteTransport.metadata.set(`plugins/${TEST_PLUGIN.id}`, metadata.encodePlugin(TEST_PLUGIN));
        const remoteComponent = remoteTransport.components.addLocalComponent('my-component');
        await remoteTransport.metadata.set('components/my-component', { id: 'my-component', plugin: TEST_PLUGIN.id });
        const onAction = sinon.fake();
        await remoteComponent.registerAction('myAction', onAction);
        await sleep(20);

        const busComponent = registry.getComponent('remote', 'my-component');
        expect(() => busComponent.executeAction('boom', true)).to.throw(`Unknown action 'boom' on component 'remote:my-component' (plugin=module.name)`);
        await sleep(20);

        expect(onAction.notCalled).to.be.true;

      } finally {
        await session.terminate();
      }
    });

    it('should fail to transmit action with bad arguments to remote component', async () => {
      const session = new MqttTestSession();
      await session.init();
      try {
        const registryTransport = await session.createTransport('registry', { presenceTracking: true });
        const remoteTransport = await session.createTransport('remote');
        const registry = new Registry({ transport: registryTransport, publishRemoteComponent: true });

        await remoteTransport.metadata.set(`plugins/${TEST_PLUGIN.id}`, metadata.encodePlugin(TEST_PLUGIN));
        const remoteComponent = remoteTransport.components.addLocalComponent('my-component');
        await remoteTransport.metadata.set('components/my-component', { id: 'my-component', plugin: TEST_PLUGIN.id });
        const onAction = sinon.fake();
        await remoteComponent.registerAction('myAction', onAction);
        await sleep(20);

        const busComponent = registry.getComponent('remote', 'my-component');
        expect(() => busComponent.executeAction('myAction', 42)).to.throw(`Wrong value '42' for type 'bool'`);
        await sleep(20);

        expect(onAction.called).to.be.false;

      } finally {
        await session.terminate();
      }
    });

    it('should handle local disconnection', async () => {
      const session = new MqttTestSession();
      await session.init();
      try {
        const registryTransport = await session.createTransport('registry', { presenceTracking: true });
        const remoteTransport = await session.createTransport('remote');
        const registry = new Registry({ transport: registryTransport, publishRemoteComponent: true });
        const boolType = new metadata.Bool();

        await remoteTransport.metadata.set(`plugins/${TEST_PLUGIN.id}`, metadata.encodePlugin(TEST_PLUGIN));

        const remoteComponent = remoteTransport.components.addLocalComponent('my-component');
        await remoteComponent.setState('myState', boolType.primitive.encode(true));
        await remoteTransport.metadata.set('components/my-component', { id: 'my-component', plugin: TEST_PLUGIN.id });
        await sleep(50);

        expectState();

        await session.disconnectTransport('registry');
        await sleep(20);

        expect(Array.from(registry.getInstanceNames())).to.deep.equal([]);

        await session.reconnectTransport('registry');
        await sleep(50);

        // expect same state than earlier
        expectState();

        function expectState() {
          const plugin = registry.getPlugin('remote', 'module.name');
          const busComponent = registry.getComponent('remote', 'my-component');
          expect(busComponent.id).to.equal('my-component');
          expect(busComponent.plugin).to.equal(plugin);
          expect(busComponent.getStates()).to.deep.equal({ myState: true });
        }

      } finally {
        await session.terminate();
      }
    });

    it('should handle remote disconnection', async () => {
      const session = new MqttTestSession();
      await session.init();
      try {
        const registryTransport = await session.createTransport('registry', { presenceTracking: true });
        const remoteTransport = await session.createTransport('remote');
        const registry = new Registry({ transport: registryTransport, publishRemoteComponent: true });
        const boolType = new metadata.Bool();

        await remoteTransport.metadata.set(`plugins/${TEST_PLUGIN.id}`, metadata.encodePlugin(TEST_PLUGIN));

        const remoteComponent = remoteTransport.components.addLocalComponent('my-component');
        await remoteComponent.setState('myState', boolType.primitive.encode(true));
        await remoteTransport.metadata.set('components/my-component', { id: 'my-component', plugin: TEST_PLUGIN.id });
        await sleep(50);

        expectState();

        await session.disconnectTransport('remote');
        await sleep(20);

        expect(Array.from(registry.getInstanceNames())).to.deep.equal([]);

        await session.reconnectTransport('remote');
        await sleep(50);

        // expect same state than earlier
        expectState();

        function expectState() {
          const plugin = registry.getPlugin('remote', 'module.name');
          const busComponent = registry.getComponent('remote', 'my-component');
          expect(busComponent.id).to.equal('my-component');
          expect(busComponent.plugin).to.equal(plugin);
          expect(busComponent.getStates()).to.deep.equal({ myState: true });
        }

      } finally {
        await session.terminate();
      }
    });
  });
});
