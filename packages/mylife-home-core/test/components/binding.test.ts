import 'mocha';
import 'reflect-metadata';
import { expect } from 'chai';
import sinon from 'sinon';
import { components, bus, tools } from 'mylife-home-common';
import { metadata, ComponentHost, BusPublisher, Binding } from '../../src/components';
import { MqttTestSession } from './tools';

describe('components/binding', () => {
  it('should transmit source state to target action on local registry', async () => {
    const session = new MqttTestSession();
    await session.init();
    try {
      const registry = new components.Registry();

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

      const sourceHost = new ComponentHost('source', registry.getPlugin(null, 'test-module.source') as metadata.LocalPlugin, {});
      const targetHost = new ComponentHost('target', registry.getPlugin(null, 'test-module.target') as metadata.LocalPlugin, {});
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
