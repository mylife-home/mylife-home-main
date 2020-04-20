import 'mocha';
import 'reflect-metadata';
import { expect } from 'chai';
import sinon from 'sinon';
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

  it('should forbid to give wrong config', () => {
    const descriptor = createComponent();
    const tester = () => new Host('id', descriptor, { config1: 42 });
    expect(tester).to.throw(`Invalid configuration for component 'id' of type 'test-component for configuration entry config1: expected type 'string' but got 'number'`);
  });

  it('should forbid to init state to a wrong value', () => {
    @component
    class TestComponent {
      @state({ type: NetType.INT8 })
      value: number = 400;
    }

    build();
    const descriptor = getDescriptor(TestComponent);
    const tester = () => new Host('id', descriptor, {});
    expect(tester).to.throw('expected value <= 127 but got 400');
  });

  it('should forbid to set state to a wrong value', () => {
    @component
    class TestComponent {
      @state({ type: NetType.INT8 })
      value: number = 42;

      @action
      fail(newValue: number) {
        this.value = 400;
      }
    }

    build();
    const descriptor = getDescriptor(TestComponent);
    const host = new Host('id', descriptor, {});
    const tester = () => host.executeAction('fail', 42);
    expect(tester).to.throw('expected value <= 127 but got 400');
  });

  it('should forbid to execute action with a wrong value', () => {
    const descriptor = createComponent();
    const host = new Host('id', descriptor, { config1: 'my-config' });
    const tester = () => host.executeAction('setValue', 'wrong');
    expect(tester).to.throw(`expected value of type 'number' but got 'string'`);
  });

  it('should call destroy on component', () => {
    const handler = sinon.fake();

    @component
    class TestComponent {
      destroy = handler;
    }

    build();
    const descriptor = getDescriptor(TestComponent);
    const host = new Host('id', descriptor, {});

    expect(handler.calledOnce).to.be.false;
    host.destroy();
    expect(handler.calledOnce).to.be.true;
  });
});

function createComponent() {
  @component
  @config({ name: 'config1', type: ConfigType.STRING })
  class TestComponent {
    constructor({ config1 }: { config1: string; }) {
      this.config = config1;
    }

    @state
    config: string;

    @state
    value: number = 42;

    @action
    setValue(newValue: number) {
      this.value = newValue;
    }
  }

  build();

  return getDescriptor(TestComponent);
}
