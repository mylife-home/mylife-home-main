import 'mocha';
import 'reflect-metadata';
import { expect } from 'chai';
import { component, config, state, action, getDescriptor, NetType, ConfigType, build } from '../src/metadata';

describe('components', () => {
  it('should produce right medata using basic decorators', () => {
    @component
    @config({ name: 'config1', type: ConfigType.STRING })
    class TestComponent {
      @state
      value: number;

      @action
      setValue(newValue: number) {
        this.value = newValue;
      }
    }

    build();

    expect(getDescriptor(TestComponent).getNetMetadata()).to.deep.equal({
      name: 'test-component',
      members: {
        value: { member: 'state', type: NetType.FLOAT },
        setValue: { member: 'action', type: NetType.FLOAT },
      },
    });


    expect(getDescriptor(TestComponent).getDesignerMetadata()).to.deep.equal({
      name: 'test-component1',
      members: {
        value: { member: 'state', type: NetType.FLOAT },
        setValue: { member: 'action', type: NetType.FLOAT },
      },
    });
  });

  it('should produce right medata using advanced decorators', () => {
    @component({ name: 'overridden-name', description: 'component description' })
    class TestComponent {
      @state({ description: 'state description', type: NetType.INT32 })
      value: number;

      @action({ description: 'action description', type: NetType.UINT8 })
      setValue(newValue: number) {
        this.value = newValue;
      }
    }

    build();

    expect(getDescriptor(TestComponent).getNetMetadata()).to.deep.equal({
      name: 'overridden-name',
      members: {
        value: { member: 'state', type: NetType.INT32 },
        setValue: { member: 'action', type: NetType.UINT8 },
      },
    });

    expect(getDescriptor(TestComponent).getDesignerMetadata()).to.deep.equal({
      name: 'overridden-name',
      members: {
        value: { member: 'state', type: NetType.INT32 },
        setValue: { member: 'action', type: NetType.UINT8 },
      },
    });
  });
});
