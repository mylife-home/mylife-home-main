import 'mocha';
import 'reflect-metadata';
import { expect } from 'chai';
import { Host } from '../src/host';
import { component, config, state, action, getDescriptor, NetType, ConfigType, build } from '../src/metadata';

describe('host', () => {
  it('should host component', () => {
    const descriptor = createComponent();

    const host = new Host('id', descriptor, { config1: 'my-config' });

    expect(host.getStates()).to.deep.equal({
      config: 'my-config',
      value: 42
    });

    host.executeAction('setValue', 73);

    expect(host.getStates()).to.deep.equal({
      config: 'my-config',
      value: 73
    });

    host.destroy();
  });
});

function createComponent() {
  @component
  @config({ name: 'config1', type: ConfigType.STRING })
  class TestComponent {
    constructor({ config1 }: { config1: string; }) {
      this.value = 42;
      this.config = config1;
    }

    @state
    config: string;

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
