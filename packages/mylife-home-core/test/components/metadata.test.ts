import 'mocha';
import 'reflect-metadata';
import { expect } from 'chai';
import { components } from 'mylife-home-common';
import { metadata } from '../../src/components';

describe('components/metadata', () => {
  it('should produce right medata using basic decorators', () => {
    const plugin = basic();

    expect(plugin).to.deep.equal({
      implementation: plugin.implementation, // will assert that on host checks
      id: 'test-module.test-plugin',
      name: 'test-plugin',
      module: 'test-module',
      version: 'test-version',
      usage: 'logic',
      description: undefined,
      members: {
        value: { memberType: 'state', valueType: new metadata.Float(), description: undefined },
        setValue: { memberType: 'action', valueType: new metadata.Float(), description: undefined },
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
        value: { memberType: 'state', valueType: new metadata.Range(-10, 10), description: 'state description' },
        setValue: { memberType: 'action', valueType: new metadata.Range(-10, 10), description: 'action description' },
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
        class TestPlugin {
          @metadata.state
          value: number;

          @metadata.action
          setValue(newValue: number) {
            this.value = newValue;
          }
        }
      });

    expect(() => testBuild()).to.throw(`Class 'TestPlugin' looks like plugin but @plugin decorator is missing`);
  });

  it('should fail if wrong action type', () => {
    const testBuild = () =>
      build(() => {
        @metadata.plugin({ usage: metadata.PluginUsage.LOGIC })
        class TestPlugin {
          @metadata.state
          value: number;

          @metadata.action({ type: new metadata.Text() })
          setValue(newValue: number) {
            this.value = newValue;
          }
        }
      });

    expect(() => testBuild()).to.throw(`Bad action 'setValue' on plugin 'TestPlugin':  Expected primitive 'String' but got 'Number'`);
  });
});

function basic() {
  return build(() => {
    @metadata.plugin({ usage: metadata.PluginUsage.LOGIC })
    class TestPlugin {
      @metadata.state
      value: number;

      @metadata.action
      setValue(newValue: number) {
        this.value = newValue;
      }
    }
  });
}

function advanced() {
  return build(() => {
    @metadata.plugin({ name: 'overridden-name', usage: metadata.PluginUsage.LOGIC, description: 'component description' })
    @metadata.config({ name: 'config1', description: 'config description', type: metadata.ConfigType.STRING })
    @metadata.config({ name: 'config2', type: metadata.ConfigType.INTEGER })
    class TestPlugin {
      @metadata.state({ description: 'state description', type: new metadata.Range(-10, 10) })
      value: number;

      @metadata.action({ description: 'action description', type: new metadata.Range(-10, 10) })
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

  const plugins = registry.getPlugins(null);
  return Array.from(plugins)[0] as metadata.LocalPlugin;
}
