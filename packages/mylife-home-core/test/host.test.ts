import 'mocha';
import 'reflect-metadata';
import { expect } from 'chai';
import sinon from 'sinon';
import { components } from 'mylife-home-common';
import { Host } from '../src/host';
import { plugin, config, state, action, ConfigType, builder, LocalPlugin, PluginUsage, Range } from '../src/metadata';

describe('host', () => {
  it('should host component', () => {
    const lplugin = createPlugin();

    const host = new Host('id', lplugin, { config1: 'my-config' });

    expect(host.getStates()).to.deep.equal({
      config: 'my-config',
      value: 42,
    });

    host.executeAction('setValue', 73);

    expect(host.getStates()).to.deep.equal({
      config: 'my-config',
      value: 73,
    });

    host.destroy();
  });

  it('should forbid to give wrong config', () => {
    const lplugin = createPlugin();
    const tester = () => new Host('id', lplugin, { config1: 42 });
    expect(tester).to.throw(`Invalid configuration for component 'id' of plugin 'test-module.test-plugin' for configuration entry 'config1': expected type 'string' but got 'number'`);
  });

  it('should forbid to init state to a wrong value', () => {
    const lplugin = build(() => {
      @plugin({ usage: PluginUsage.LOGIC })
      class TestPlugin {
        @state({ type: new Range(0, 100) })
        value: number = 400;
      }
    });

    const tester = () => new Host('id', lplugin, {});
    expect(tester).to.throw(`Wrong value '400' for type 'range[0;100]'`);
  });

  it('should forbid to set state to a wrong value', () => {
    const lplugin = build(() => {
      @plugin({ usage: PluginUsage.LOGIC })
      class TestPlugin {
        @state({ type: new Range(0, 100) })
        value: number = 42;

        @action
        fail(newValue: number) {
          this.value = 400;
        }
      }
    });

    const host = new Host('id', lplugin, {});
    const tester = () => host.executeAction('fail', 42);
    expect(tester).to.throw(`Wrong value '400' for type 'range[0;100]'`);
  });

  it('should forbid to execute action with a wrong value', () => {
    const lplugin = createPlugin();
    const host = new Host('id', lplugin, { config1: 'my-config' });
    const tester = () => host.executeAction('setValue', 'wrong');
    expect(tester).to.throw(`Wrong value 'wrong' for type 'float'`);
  });

  it('should call destroy on component', () => {
    const handler = sinon.fake();
    const lplugin = build(() => {
      @plugin({ usage: PluginUsage.LOGIC })
      class TestPlugin {
        destroy = handler;
      }
    });

    const host = new Host('id', lplugin, {});
    expect(handler.calledOnce).to.be.false;
    host.destroy();
    expect(handler.calledOnce).to.be.true;
  });
});

function createPlugin() {
  return build(() => {
    @plugin({ usage: PluginUsage.LOGIC })
    @config({ name: 'config1', type: ConfigType.STRING })
    class TestPlugin {
      constructor({ config1 }: { config1: string }) {
        this.config = config1;
      }

      @state
      config: string;

      @state
      value: number = 42;

      @action
      setValue(newValue: number) {
        this.value = newValue;
      }
    }
  });
}

function build(callback: () => void) {
  const registry = new components.Registry();
  builder.init('test-module', 'test-version', registry);
  try {
    callback();
    builder.build();
  } finally {
    builder.terminate();
  }

  return registry.getPlugin(null, 'test-module.test-plugin') as LocalPlugin;
}
