import 'mocha';
import { expect } from 'chai';
import sinon from 'sinon';
import { MqttTestSession, delayError, sleep } from '../bus/tools';
import { Registry, metadata } from '../../src/components';

const TEST_PLUGIN: metadata.Plugin = Object.freeze({
  id: 'module.name',
  name: 'name',
  module: 'module',
  usage: metadata.PluginUsage.LOGIC,
  version: '1.0.0',
  description: 'M yplugin',
  members: {
    myAction: { description: 'My action', memberType: metadata.MemberType.ACTION, valueType: new metadata.Bool() },
    myState: { description: 'My state', memberType: metadata.MemberType.STATE, valueType: new metadata.Bool() },
  }
});

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

  // TODO: same with components
  // TODO: test bus-publisher
});
