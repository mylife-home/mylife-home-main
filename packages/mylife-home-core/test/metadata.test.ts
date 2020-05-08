import 'mocha';
import 'reflect-metadata';
import { expect } from 'chai';
import { components } from 'mylife-home-common';
import { plugin, config, state, action, Text, Float, Range, PluginUsage, ConfigType, builder, LocalPlugin } from '../src/metadata';

describe('metadata', () => {
  it('should produce right medata using basic decorators', () => {
    const plugin = basic();

    expect(plugin).to.deep.equal({
      implementation: plugin.implementation, // will assert that on host checks
      id: 'test-module.test-component',
      name: 'test-component',
      module: 'test-module',
      version: 'test-version',
      usage: 'logic',
      description: undefined,
      members: {
        value: { memberType: 'state', valueType: new Float(), description: undefined },
        setValue: { memberType: 'action', valueType: new Float(), description: undefined },
      },
      config: {},
    });
  });

  it('should produce right medata using advanced decorators', () => {
    const plugin = advanced();

    expect(plugin).to.deep.equal({
      implementation: plugin.implementation, // will assert that on host checks
      id: 'test-module.overridden-name',
      name: 'overridden-name',
      module: 'test-module',
      version: 'test-version',
      usage: 'logic',
      description: 'component description',
      members: {
        value: { memberType: 'state', valueType: new Range(-10, 10), description: 'state description' },
        setValue: { memberType: 'action', valueType: new Range(-10, 10), description: 'action description' },
      },
      config: {
        config1: { valueType: 'string', description: 'config description' },
        config2: { valueType: 'integer', description: undefined },
      },
    });
  });

  it('should fail if missing component decorator', () => {
    const testBuild = () =>
      build(() => {
        class TestComponent {
          @state
          value: number;

          @action
          setValue(newValue: number) {
            this.value = newValue;
          }
        }
      });

    expect(() => testBuild()).to.throw(`Class 'TestComponent' looks like plugin but @plugin decorator is missing`);
  });

  it('should fail if wrong action type', () => {
    const testBuild = () =>
      build(() => {
        @plugin({ usage: PluginUsage.LOGIC })
        class TestComponent {
          @state
          value: number;

          @action({ type: new Text() })
          setValue(newValue: number) {
            this.value = newValue;
          }
        }
      });

    expect(() => testBuild()).to.throw(`Bad action 'setValue' on component 'TestComponent':  Expected primitive 'String' but got 'Number'`);
  });
});

function basic() {
  return build(() => {
    @plugin({ usage: PluginUsage.LOGIC })
    class TestComponent {
      @state
      value: number;

      @action
      setValue(newValue: number) {
        this.value = newValue;
      }
    }
  });
}

function advanced() {
  return build(() => {
    @plugin({ name: 'overridden-name', usage: PluginUsage.LOGIC, description: 'component description' })
    @config({ name: 'config1', description: 'config description', type: ConfigType.STRING })
    @config({ name: 'config2', type: ConfigType.INTEGER })
    class TestComponent {
      @state({ description: 'state description', type: new Range(-10, 10) })
      value: number;

      @action({ description: 'action description', type: new Range(-10, 10) })
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

  const plugins = registry.getPlugins(null);
  return Array.from(plugins)[0] as LocalPlugin;
}
