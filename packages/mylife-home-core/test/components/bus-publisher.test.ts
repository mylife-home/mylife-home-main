import 'mocha';
import 'reflect-metadata';
import { expect } from 'chai';
import sinon from 'sinon';
import { components, bus, tools } from 'mylife-home-common';
import { metadata, ComponentHost, BusPublisher } from '../../src/components';
import { MqttTestSession } from './tools';

describe('components/host', () => {
  it('should publish component', async () => {
    const session = new MqttTestSession();
    await session.init();
    try {
      interface Instance {
        transport?: bus.Transport;
        registry?: components.Registry;
      }

      const tester: Instance = {};
      tester.transport = await session.createTransport('tester');
      tester.registry = new components.Registry({ transport: tester.transport });
      const busPublisher = new BusPublisher(tester.registry, tester.transport);

      const observer: Instance = {};
      observer.transport = await session.createTransport('observer', { presenceTracking: true });
      observer.registry = new components.Registry({ transport: observer.transport, publishRemoteComponents: true });

      const actionHandler = sinon.fake();

      const plugin = build(tester.registry, () => {
        @metadata.plugin({ usage: metadata.PluginUsage.LOGIC })
        class TestPlugin {
          constructor() {}

          @metadata.state
          value: number = 42;

          @metadata.action
          setValue(newValue: number) {
            actionHandler(newValue);
            this.value = newValue;
          }
        }
      });

      const component = new ComponentHost('my-component', plugin, {});
      tester.registry.addComponent(null, component);

      await tools.sleep(20);

      const remotePlugin = observer.registry.getPlugin('tester', 'test-module.test-plugin');
      expect(remotePlugin).to.deep.equal(plugin);

      const remoteComponent = observer.registry.getComponent('tester', 'my-component');
      expect(remoteComponent).to.exist;

      expect(remoteComponent.getStates()).to.deep.equal({ value: 42 });
      expect(actionHandler.notCalled).to.be.true;

      remoteComponent.executeAction('setValue', 43);

      expect(remoteComponent.getStates()).to.deep.equal({ value: 43 });
      expect(actionHandler.calledOnceWithExactly(43)).to.be.true;
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

  return registry.getPlugin(null, 'test-module.test-plugin') as metadata.LocalPlugin;
}
