import 'mocha';
import 'reflect-metadata';
import { expect } from 'chai';
import { component, state, action, getDescriptor, ComponentDescriptor, Type } from '../src/metadata';

describe('components', () => {
  it('should produce right medata using basic decorators', () => {
    @component
    class TestComponent1 {
      @state
      value: number;

      @action
      setValue(newValue: number) {
        this.value = newValue;
      }
    }

    expect(getDescriptor(TestComponent1).toMetadata()).to.deep.equal({
      name: 'test-component1',
      members: {
        value: { member: 'state', type: Type.FLOAT },
        setValue: { member: 'action', type: Type.FLOAT },
      },
    });
  });

  it('should produce right medata using advanced decorators', () => {
    @component({ name: 'overridden-name' })
    class TestComponent2 {
      @state({ type: Type.INT32 })
      value: number;

      @action({ type: Type.UINT8 })
      setValue(newValue: number) {
        this.value = newValue;
      }
    }

    expect(getDescriptor(TestComponent2).toMetadata()).to.deep.equal({
      name: 'overridden-name',
      members: {
        value: { member: 'state', type: Type.INT32 },
        setValue: { member: 'action', type: Type.UINT8 },
      },
    });
  });
});
