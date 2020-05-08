import 'mocha';
import 'reflect-metadata';
import { expect } from 'chai';
import { component, config, state, action, getDescriptor, Text, Float, Range, PluginUsage, ConfigType, build } from '../src/metadata';

describe('metadata', () => {
  it('should produce right medata using basic decorators', () => {
    const descriptor = basic();

    expect(descriptor.getMetadata()).to.deep.equal({
      id: 'module-TODO.test-component',
      name: 'test-component',
      module: 'module-TODO',
      version: '1.0.0-TODO',
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
    const descriptor = advanced();

    expect(descriptor.getMetadata()).to.deep.equal({
      id: 'module-TODO.overridden-name',
      name: 'overridden-name',
      module: 'module-TODO',
      version: '1.0.0-TODO',
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
    class TestComponent {
      @state
      value: number;

      @action
      setValue(newValue: number) {
        this.value = newValue;
      }
    }

    expect(() => build()).to.throw(`Class 'TestComponent' looks like component but @component decorator is missing`);
  });

  it('should fail if wrong action type', () => {
    class TestComponent {
      @state
      value: number;

      @action({ type: new Text() })
      setValue(newValue: number) {
        this.value = newValue;
      }
    }

    expect(() => build()).to.throw(`Class 'TestComponent' looks like component but @component decorator is missing`);
  });
});

function basic() {
  @component({ usage: PluginUsage.LOGIC })
  class TestComponent {
    @state
    value: number;

    @action
    setValue(newValue: number) {
      this.value = newValue;
    }
  }

  build();

  return getDescriptor(TestComponent);
}

function advanced() {
  @component({ name: 'overridden-name', usage: PluginUsage.LOGIC, description: 'component description' })
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

  build();

  return getDescriptor(TestComponent);
}
