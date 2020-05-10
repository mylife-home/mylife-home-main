import 'mocha';
import 'reflect-metadata';
import { expect } from 'chai';
import sinon from 'sinon';
import { components, bus } from 'mylife-home-common';
import { metadata, ComponentHost, BusPublisher } from '../../src/components';
import { MqttTestSession } from 'mylife-home-common/test/bus/tools';

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
      tester.transport = await session.createTransport('tester'),
      tester.registry = new components.Registry({ transport: tester.transport });
      const busPublisher = new BusPublisher(tester.registry, tester.transport);

      const observer: Instance = {};
      observer.transport = await session.createTransport('observer', { presenceTracking: true }),
      observer.registry = new components.Registry({ transport: observer.transport, publishRemoteComponents: true });

      const actionHandler = sinon.fake();

      const plugin = build(tester.registry, () => {
        @metadata.plugin({ usage: metadata.PluginUsage.LOGIC })
        class TestPlugin {
          constructor() {
          }
    
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

      const remoteComponent = observer.registry.getComponent('tester', 'my-component');
      expect(remoteComponent).to.exist;
      expect(remote)
      expect()

    } finally {
      await session.terminate();
    }
  });
});

function build(registry, callback: () => void) {
  metadata.builder.init('test-module', 'test-version', registry);
  try {
    callback();
    metadata.builder.build();
  } finally {
    metadata.builder.terminate();
  }

  return registry.getPlugin(null, 'test-module.test-plugin') as metadata.LocalPlugin;
}
