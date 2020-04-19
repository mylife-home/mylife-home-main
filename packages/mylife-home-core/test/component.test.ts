import 'mocha';
import { expect } from 'chai';
import { component, state, action, getTypes } from '../src/metadata';
import 'reflect-metadata';

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
    
    console.log(getTypes());

  });
});