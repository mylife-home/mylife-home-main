import 'mocha';
import 'reflect-metadata';
import { expect } from 'chai';
import { component, config, state, action, getDescriptor, Float, Range, Enum, PluginUsage, ConfigType, build } from '../src/metadata';

describe('metadata', () => {
  it('should produce right medata using basic decorators', () => {
    const descriptor = basic();

    expect(descriptor.getMetadata()).to.deep.equal({
      name: 'test-component',
      members: {
        value: { member: 'state', type: new Float() },
        setValue: { member: 'action', type: new Float() },
      },
      config: {}
    });
  });

  it('should produce right medata using advanced decorators', () => {
    const descriptor = advanced();

    expect(descriptor.getMetadata()).to.deep.equal({
      name: 'overridden-name',
      description: 'component description',
      members: {
        value: { member: 'state', type: new Range(-10, 10), description: 'state description' },
        setValue: { member: 'action', type: new Enum('a', 'b', 'c'), description: 'action description' },
      },
      config: {
        config1: { type: 'string', description: 'config description' },
        config2: { type: 'integer' },
      }
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

    @action({ description: 'action description', type: new Enum('a', 'b', 'c') })
    setValue(newValue: number) {
      this.value = newValue;
    }
  }

  build();

  return getDescriptor(TestComponent);
}
