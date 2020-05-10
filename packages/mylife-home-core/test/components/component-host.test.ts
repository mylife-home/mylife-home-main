import 'mocha';
import 'reflect-metadata';
import { expect } from 'chai';
import sinon from 'sinon';
import { components } from 'mylife-home-common';
import { metadata, ComponentHost } from '../../src/components';

describe('components/component-host', () => {
  it('should host component', () => {
    const plugin = createPlugin();

    const component = new ComponentHost('id', plugin, { config1: 'my-config' });

    expect(component.getStates()).to.deep.equal({
      config: 'my-config',
      value: 42,
    });

    component.executeAction('setValue', 73);

    expect(component.getStates()).to.deep.equal({
      config: 'my-config',
      value: 73,
    });

    component.destroy();
  });

  it('should forbid to give wrong config', () => {
    const plugin = createPlugin();
    const tester = () => new ComponentHost('id', plugin, { config1: 42 });
    expect(tester).to.throw(`Invalid configuration for component 'id' of plugin 'test-module.test-plugin' for configuration entry 'config1': expected type 'string' but got 'number'`);
  });

  it('should forbid to init state to a wrong value', () => {
    const plugin = build(() => {
      @metadata.plugin({ usage: metadata.PluginUsage.LOGIC })
      class TestPlugin {
        @metadata.state({ type: new metadata.Range(0, 100) })
        value: number = 400;
      }
    });

    const tester = () => new ComponentHost('id', plugin, {});
    expect(tester).to.throw(`Wrong value '400' for type 'range[0;100]'`);
  });

  it('should forbid to set state to a wrong value', () => {
    const plugin = build(() => {
      @metadata.plugin({ usage: metadata.PluginUsage.LOGIC })
      class TestPlugin {
        @metadata.state({ type: new metadata.Range(0, 100) })
        value: number = 42;

        @metadata.action
        fail(newValue: number) {
          this.value = 400;
        }
      }
    });

    const component = new ComponentHost('id', plugin, {});
    const tester = () => component.executeAction('fail', 42);
    expect(tester).to.throw(`Wrong value '400' for type 'range[0;100]'`);
  });

  it('should forbid to execute action with a wrong value', () => {
    const plugin = createPlugin();
    const component = new ComponentHost('id', plugin, { config1: 'my-config' });
    const tester = () => component.executeAction('setValue', 'wrong');
    expect(tester).to.throw(`Wrong value 'wrong' for type 'float'`);
  });

  it('should call destroy on component', () => {
    const handler = sinon.fake();
    const plugin = build(() => {
      @metadata.plugin({ usage: metadata.PluginUsage.LOGIC })
      class TestPlugin {
        destroy = handler;
      }
    });

    const component = new ComponentHost('id', plugin, {});
    expect(handler.calledOnce).to.be.false;
    component.destroy();
    expect(handler.calledOnce).to.be.true;
  });
});

function createPlugin() {
  return build(() => {
    @metadata.plugin({ usage: metadata.PluginUsage.LOGIC })
    @metadata.config({ name: 'config1', type: metadata.ConfigType.STRING })
    class TestPlugin {
      constructor({ config1 }: { config1: string }) {
        this.config = config1;
      }

      @metadata.state
      config: string;

      @metadata.state
      value: number = 42;

      @metadata.action
      setValue(newValue: number) {
        this.value = newValue;
      }
    }
  });
}

function build(callback: () => void) {
  const registry = new components.Registry();
  metadata.builder.init('test-module', 'test-version', registry);
  try {
    callback();
    metadata.builder.build();
  } finally {
    metadata.builder.terminate();
  }

  return registry.getPlugin(null, 'test-module.test-plugin') as metadata.LocalPlugin;
}
