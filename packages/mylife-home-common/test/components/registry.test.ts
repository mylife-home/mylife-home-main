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
  });

  // TODO: test bus-publisher
});
