import 'mocha';
import 'reflect-metadata';
import { expect } from 'chai';
import { component, state, action, getDescriptor, ComponentDescriptor } from '../src/metadata';

@component({ name: 'overridden-name'})
class TestComponent {
  @state
  value: number;

  @action
  setValue(newValue: number) {
    this.value = newValue;
  }
}

describe('components', () => {
  it('should ...', () => {
    console.log(getDescriptor(TestComponent).toMetadata());
  });
});