import 'mocha';
import 'reflect-metadata';
import { expect } from 'chai';
import sinon from 'sinon';
import { components, bus, tools } from 'mylife-home-common';
import { metadata, ComponentHost, BusPublisher, Binding } from '../../src/components';
import { MqttTestSession } from './tools';

describe('components/binding', () => {
  it('should transmit source state to target action on local registry', () => {
    const registry = new components.Registry();
    const { emitSource, actionHandler, sourceHost, targetHost } = createSourceAndTarget(registry);

    registry.addComponent(null, sourceHost);
    registry.addComponent(null, targetHost);

    emitSource(42);
    expect(actionHandler.notCalled).to.be.true;

    const binding = new Binding(registry, { sourceId: 'source', sourceState: 'value', targetId: 'target', targetAction: 'setValue' });

    expect(actionHandler.calledOnceWithExactly(42)).to.be.true;

    actionHandler.resetHistory();

    emitSource(43);
    expect(actionHandler.calledOnceWithExactly(43)).to.be.true;

    actionHandler.resetHistory();
    binding.close();

    emitSource(42);
    expect(actionHandler.notCalled).to.be.true;
  });

  it('should bind when source join back', () => {
    const registry = new components.Registry();
    const { emitSource, actionHandler, sourceHost, targetHost } = createSourceAndTarget(registry);

    registry.addComponent(null, targetHost);
    emitSource(42);
    const binding = new Binding(registry, { sourceId: 'source', sourceState: 'value', targetId: 'target', targetAction: 'setValue' });

    expect(actionHandler.notCalled).to.be.true;

    registry.addComponent(null, sourceHost);
    expect(actionHandler.calledOnceWithExactly(42)).to.be.true;

    actionHandler.resetHistory();

    registry.removeComponent(null, sourceHost);
    emitSource(43);
    registry.addComponent(null, sourceHost);

    expect(actionHandler.calledOnceWithExactly(43)).to.be.true;

    binding.close();
  });


  it('should bind when target join back', () => {
    const registry = new components.Registry();
    const { emitSource, actionHandler, sourceHost, targetHost } = createSourceAndTarget(registry);

    registry.addComponent(null, sourceHost);
    emitSource(42);
    const binding = new Binding(registry, { sourceId: 'source', sourceState: 'value', targetId: 'target', targetAction: 'setValue' });

    expect(actionHandler.notCalled).to.be.true;

    registry.addComponent(null, targetHost);
    expect(actionHandler.calledOnceWithExactly(42)).to.be.true;

    actionHandler.resetHistory();

    registry.removeComponent(null, targetHost);
    emitSource(43);
    registry.addComponent(null, targetHost);

    expect(actionHandler.calledOnceWithExactly(43)).to.be.true;

    binding.close();
  });

  it('should have same behavior on remote components', async () => {
    const session = new MqttTestSession();
    await session.init();
    try {
      const providerTransport = await session.createTransport('provider');
      const providerRegistry = new components.Registry({ transport: providerTransport });
      const busPublisher = new BusPublisher(providerRegistry, providerTransport);

      const binderTransport = await session.createTransport('binder', { presenceTracking: true });
      const binderRegistry = new components.Registry({ transport: binderTransport, publishRemoteComponents: true });

      const { emitSource, actionHandler, sourceHost, targetHost } = createSourceAndTarget(providerRegistry);
      providerRegistry.addComponent(null, sourceHost);
      providerRegistry.addComponent(null, targetHost);

      emitSource(42);
      expect(actionHandler.notCalled).to.be.true;

      const binding = new Binding(binderRegistry, { sourceId: 'source', sourceState: 'value', targetId: 'target', targetAction: 'setValue' });

      await tools.sleep(100);
      expect(actionHandler.calledOnceWithExactly(42)).to.be.true;

      actionHandler.resetHistory();

      emitSource(43);
      await tools.sleep(100);
      expect(actionHandler.calledOnceWithExactly(43)).to.be.true;

      actionHandler.resetHistory();

      binding.close();

      emitSource(44);
      await tools.sleep(100);
      expect(actionHandler.notCalled).to.be.true;

    } finally {
      await session.terminate();
    }
  });
});

function build(registry: components.Registry, callback: () => void) {
  metadata.builder.init('test-module', 'test-version', registry);
  try {
    callback();
    metadata.builder.build();
  } finally {
    metadata.builder.terminate();
  }
}

function createSourceAndTarget(registry: components.Registry) {
  let emitSource: (value: number) => void;
  const actionHandler = sinon.fake();

  build(registry, () => {
    @metadata.plugin({ usage: metadata.PluginUsage.LOGIC })
    class Source {
      constructor() {
        emitSource = (value: number) => {
          this.value = value;
        };
      }

      @metadata.state
      value: number = 42;
    }

    @metadata.plugin({ usage: metadata.PluginUsage.LOGIC })
    class Target {

      @metadata.action
      setValue(value: number) {
        actionHandler(value);
      }
    }
  });

  const sourcePlugin = registry.getPlugin(null, 'test-module.source') as metadata.LocalPlugin;
  const targetPlugin = registry.getPlugin(null, 'test-module.target') as metadata.LocalPlugin;

  const sourceHost = new ComponentHost('source', sourcePlugin, {});
  const targetHost = new ComponentHost('target', targetPlugin, {});

  return { emitSource, actionHandler, sourceHost, targetHost };
}