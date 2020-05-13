import 'mocha';
import 'reflect-metadata';
import { expect } from 'chai';
import sinon from 'sinon';
import { components, tools } from 'mylife-home-common';
import { metadata, ComponentHost, BusPublisher, Binding } from '../../src/components';
import { MqttTestSession } from './tools';

describe('components/binding', () => {
  it('should transmit source state to target action on local registry', () => {
    const registry = new components.Registry();
    const { emitSource, actionHandler, createComponentHost } = createSourceAndTarget(registry);
    registry.addComponent(null, createComponentHost('source', 'source'));
    registry.addComponent(null, createComponentHost('target', 'target'));

    emitSource(42);
    expect(actionHandler.notCalled).to.be.true;

    const binding = new Binding(registry, { sourceId: 'source', sourceState: 'value', targetId: 'target', targetAction: 'setValue' });

    expect(actionHandler.calledOnceWithExactly('Target.setValue', 42)).to.be.true;

    actionHandler.resetHistory();

    emitSource(43);
    expect(actionHandler.calledOnceWithExactly('Target.setValue', 43)).to.be.true;

    actionHandler.resetHistory();
    binding.close();

    emitSource(42);
    expect(actionHandler.notCalled).to.be.true;
  });

  it('should bind when source join back', () => {
    const registry = new components.Registry();
    const { emitSource, actionHandler, createComponentHost } = createSourceAndTarget(registry);
    const sourceHost = createComponentHost('source', 'source');
    const targetHost = createComponentHost('target', 'target');

    registry.addComponent(null, targetHost);
    emitSource(42);
    const binding = new Binding(registry, { sourceId: 'source', sourceState: 'value', targetId: 'target', targetAction: 'setValue' });

    expect(actionHandler.notCalled).to.be.true;

    registry.addComponent(null, sourceHost);
    expect(actionHandler.calledOnceWithExactly('Target.setValue', 42)).to.be.true;

    actionHandler.resetHistory();

    registry.removeComponent(null, sourceHost);
    emitSource(43);
    registry.addComponent(null, sourceHost);

    expect(actionHandler.calledOnceWithExactly('Target.setValue', 43)).to.be.true;

    binding.close();
  });


  it('should bind when target join back', () => {
    const registry = new components.Registry();
    const { emitSource, actionHandler, createComponentHost } = createSourceAndTarget(registry);
    const sourceHost = createComponentHost('source', 'source');
    const targetHost = createComponentHost('target', 'target');

    registry.addComponent(null, sourceHost);
    emitSource(42);
    const binding = new Binding(registry, { sourceId: 'source', sourceState: 'value', targetId: 'target', targetAction: 'setValue' });

    expect(actionHandler.notCalled).to.be.true;

    registry.addComponent(null, targetHost);
    expect(actionHandler.calledOnceWithExactly('Target.setValue', 42)).to.be.true;

    actionHandler.resetHistory();

    registry.removeComponent(null, targetHost);
    emitSource(43);
    registry.addComponent(null, targetHost);

    expect(actionHandler.calledOnceWithExactly('Target.setValue', 43)).to.be.true;

    binding.close();
  });

  it('should report error on type mismatch', () => {
    const registry = new components.Registry();
    const { emitSource, actionHandler, createComponentHost } = createSourceAndTarget(registry);
    registry.addComponent(null, createComponentHost('source', 'source'));
    registry.addComponent(null, createComponentHost('target', 'target-other-type'));

    emitSource(42);
    expect(actionHandler.notCalled).to.be.true;

    const binding = new Binding(registry, { sourceId: 'source', sourceState: 'value', targetId: 'target', targetAction: 'setValue' });
    expect(actionHandler.notCalled).to.be.true;
    expect(binding.active).to.be.false;
    expect(binding.error).to.be.true;
    expect(binding.errors).to.deep.equal([`State 'value' on component 'source' (plugin='local:test-module.source') has type 'float', which is different from type 'text' for action 'setValue' on component 'target' (plugin='local:test-module.target-other-type')`]);

    emitSource(43);
    expect(actionHandler.notCalled).to.be.true;
  });

  it('should report error on type mismatch after leave/back', () => {
    const registry = new components.Registry();
    const { emitSource, actionHandler, createComponentHost } = createSourceAndTarget(registry);
    const sourceHost = createComponentHost('source', 'source');
    const targetHost = createComponentHost('target', 'target');

    registry.addComponent(null, sourceHost);
    registry.addComponent(null, targetHost);

    emitSource(42);
    const binding = new Binding(registry, { sourceId: 'source', sourceState: 'value', targetId: 'target', targetAction: 'setValue' });

    expect(actionHandler.calledOnceWithExactly('Target.setValue', 42)).to.be.true;
    expect(binding.active).to.be.true;
    expect(binding.error).to.be.false;

    actionHandler.resetHistory();

    registry.removeComponent(null, targetHost);
    const otherTargetHost = createComponentHost('target', 'target-other-type');
    registry.addComponent(null, otherTargetHost);

    expect(actionHandler.notCalled).to.be.true;
    expect(binding.active).to.be.false;
    expect(binding.error).to.be.true;
    expect(binding.errors).to.deep.equal([`State 'value' on component 'source' (plugin='local:test-module.source') has type 'float', which is different from type 'text' for action 'setValue' on component 'target' (plugin='local:test-module.target-other-type')`]);

    emitSource(43);
    expect(actionHandler.notCalled).to.be.true;
  });

  it('should report error on missing source state', () => {
    const registry = new components.Registry();
    const { emitSource, actionHandler, createComponentHost } = createSourceAndTarget(registry);
    registry.addComponent(null, createComponentHost('source', 'other-source'));
    registry.addComponent(null, createComponentHost('target', 'target'));

    emitSource(42);
    expect(actionHandler.notCalled).to.be.true;

    const binding = new Binding(registry, { sourceId: 'source', sourceState: 'value', targetId: 'target', targetAction: 'setValue' });
    expect(actionHandler.notCalled).to.be.true;
    expect(binding.active).to.be.false;
    expect(binding.error).to.be.true;
    expect(binding.errors).to.deep.equal([`State 'value' does not exist on component 'source' (plugin='local:test-module.other-source')`]);

    emitSource(43);
    expect(actionHandler.notCalled).to.be.true;
  });

  it('should report error on missing source state after leave/back', () => {
    const registry = new components.Registry();
    const { emitSource, actionHandler, createComponentHost } = createSourceAndTarget(registry);
    const sourceHost = createComponentHost('source', 'source');
    const targetHost = createComponentHost('target', 'target');

    registry.addComponent(null, sourceHost);
    registry.addComponent(null, targetHost);

    emitSource(42);
    const binding = new Binding(registry, { sourceId: 'source', sourceState: 'value', targetId: 'target', targetAction: 'setValue' });

    expect(actionHandler.calledOnceWithExactly('Target.setValue', 42)).to.be.true;
    expect(binding.active).to.be.true;
    expect(binding.error).to.be.false;

    actionHandler.resetHistory();

    registry.removeComponent(null, sourceHost);
    const otherSourceHost = createComponentHost('source', 'other-source');
    registry.addComponent(null, otherSourceHost);

    expect(actionHandler.notCalled).to.be.true;
    expect(binding.active).to.be.false;
    expect(binding.error).to.be.true;
    expect(binding.errors).to.deep.equal([`State 'value' does not exist on component 'source' (plugin='local:test-module.other-source')`]);

    emitSource(43);
    expect(actionHandler.notCalled).to.be.true;
  });

  it('should report error on missing target action', () => {
    const registry = new components.Registry();
    const { emitSource, actionHandler, createComponentHost } = createSourceAndTarget(registry);
    registry.addComponent(null, createComponentHost('source', 'source'));
    registry.addComponent(null, createComponentHost('target', 'other-target'));

    emitSource(42);
    expect(actionHandler.notCalled).to.be.true;

    const binding = new Binding(registry, { sourceId: 'source', sourceState: 'value', targetId: 'target', targetAction: 'setValue' });
    expect(actionHandler.notCalled).to.be.true;
    expect(binding.active).to.be.false;
    expect(binding.error).to.be.true;
    expect(binding.errors).to.deep.equal([`Action 'setValue' does not exist on component 'target' (plugin='local:test-module.other-target')`]);

    emitSource(43);
    expect(actionHandler.notCalled).to.be.true;
  });

  it('should report error on missing target action after leave/back', () => {
    const registry = new components.Registry();
    const { emitSource, actionHandler, createComponentHost } = createSourceAndTarget(registry);
    const sourceHost = createComponentHost('source', 'source');
    const targetHost = createComponentHost('target', 'target');

    registry.addComponent(null, sourceHost);
    registry.addComponent(null, targetHost);

    emitSource(42);
    const binding = new Binding(registry, { sourceId: 'source', sourceState: 'value', targetId: 'target', targetAction: 'setValue' });

    expect(actionHandler.calledOnceWithExactly('Target.setValue', 42)).to.be.true;
    expect(binding.active).to.be.true;
    expect(binding.error).to.be.false;

    actionHandler.resetHistory();

    registry.removeComponent(null, targetHost);
    const otherTargetHost = createComponentHost('target', 'other-target');
    registry.addComponent(null, otherTargetHost);

    expect(actionHandler.notCalled).to.be.true;
    expect(binding.active).to.be.false;
    expect(binding.error).to.be.true;
    expect(binding.errors).to.deep.equal([`Action 'setValue' does not exist on component 'target' (plugin='local:test-module.other-target')`]);

    emitSource(43);
    expect(actionHandler.notCalled).to.be.true;
  });

  it('should report if both source and target props are wrong', () => {
    const registry = new components.Registry();
    const { emitSource, actionHandler, createComponentHost } = createSourceAndTarget(registry);
    registry.addComponent(null, createComponentHost('source', 'other-source'));
    registry.addComponent(null, createComponentHost('target', 'other-target'));

    emitSource(42);
    expect(actionHandler.notCalled).to.be.true;

    const binding = new Binding(registry, { sourceId: 'source', sourceState: 'value', targetId: 'target', targetAction: 'setValue' });
    expect(actionHandler.notCalled).to.be.true;
    expect(binding.active).to.be.false;
    expect(binding.error).to.be.true;
    expect(binding.errors).to.deep.equal([
      `State 'value' does not exist on component 'source' (plugin='local:test-module.other-source')`,
      `Action 'setValue' does not exist on component 'target' (plugin='local:test-module.other-target')`
    ]);

    emitSource(43);
    expect(actionHandler.notCalled).to.be.true;

  })

  it('should have same behavior on remote components', async () => {
    const session = new MqttTestSession();
    await session.init();
    try {
      const providerTransport = await session.createTransport('provider');
      const providerRegistry = new components.Registry({ transport: providerTransport });
      const busPublisher = new BusPublisher(providerRegistry, providerTransport);

      const binderTransport = await session.createTransport('binder', { presenceTracking: true });
      const binderRegistry = new components.Registry({ transport: binderTransport, publishRemoteComponents: true });

      const { emitSource, actionHandler, createComponentHost } = createSourceAndTarget(providerRegistry);
      providerRegistry.addComponent(null, createComponentHost('source', 'source'));
      providerRegistry.addComponent(null, createComponentHost('target', 'target'));

      emitSource(42);
      expect(actionHandler.notCalled).to.be.true;

      const binding = new Binding(binderRegistry, { sourceId: 'source', sourceState: 'value', targetId: 'target', targetAction: 'setValue' });

      await tools.sleep(100);
      expect(actionHandler.calledOnceWithExactly('Target.setValue', 42)).to.be.true;

      actionHandler.resetHistory();

      emitSource(43);
      await tools.sleep(100);
      expect(actionHandler.calledOnceWithExactly('Target.setValue', 43)).to.be.true;

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
  const sourceEmitters = new Set<(value: number) => void>();
  const emitSource = (value: number) => {
    for (const emitter of sourceEmitters) {
      emitter(value);
    }
  };

  const actionHandler = sinon.fake();

  build(registry, () => {
    @metadata.plugin({ usage: metadata.PluginUsage.LOGIC })
    class Source {
      constructor() {
        sourceEmitters.add((value: number) => {
          this.value = value;
        });
      }

      @metadata.state
      value: number = 42;
    }

    @metadata.plugin({ usage: metadata.PluginUsage.LOGIC })
    class Target {

      @metadata.action
      setValue(value: number) {
        actionHandler('Target.setValue', value);
      }
    }

    @metadata.plugin({ usage: metadata.PluginUsage.LOGIC })
    class OtherSource {
      constructor() {
        sourceEmitters.add((value: number) => {
          this.otherValue = value;
        });
      }

      @metadata.state
      otherValue: number = 42;
    }

    @metadata.plugin({ usage: metadata.PluginUsage.LOGIC })
    class OtherTarget {

      @metadata.action
      setOtherValue(value: number) {
        actionHandler('OtherTarget.setOtherValue', value);
      }
    }

    @metadata.plugin({ usage: metadata.PluginUsage.LOGIC })
    class TargetOtherType {

      @metadata.action
      setValue(value: string) {
        actionHandler('TargetOtherType.setValue', value);
      }
    }
  });

  const createComponentHost = (id: string, pluginName: string) => {
    const plugin = registry.getPlugin(null, `test-module.${pluginName}`) as metadata.LocalPlugin;
    return new ComponentHost(id, plugin, {});
  };

  return { emitSource, actionHandler, createComponentHost };
}