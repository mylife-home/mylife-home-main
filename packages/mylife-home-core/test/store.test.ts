import 'mocha';
import { expect } from 'chai';
import { tools } from 'mylife-home-common';
import { Store } from '../src/store';
import { StoreItem } from '../src/store/model';

describe('store', () => {
  it('should execute various binding operations on store', () => {
    const items: StoreItem[] = [];
    tools.injectConfig({ store: { type: 'memory', items } });
    const store = new Store();

    const binding = { sourceComponent: 'sourceComponent', sourceState: 'sourceState', targetComponent: 'targetComponent', targetAction: 'targetAction' };
    store.addBinding(binding);

    expect(Array.from(store.getBindings())).to.deep.equal([binding]);

    store.removeBinding(binding);
    expect(Array.from(store.getBindings())).to.deep.equal([]);

    const otherBinding1 = { sourceComponent: 'other1', sourceState: 'sourceState', targetComponent: 'targetComponent', targetAction: 'targetAction' };
    const otherBinding2 = { sourceComponent: 'other2', sourceState: 'sourceState', targetComponent: 'targetComponent', targetAction: 'targetAction' };
    store.addBinding(binding);
    store.addBinding(binding);
    store.addBinding(otherBinding1);

    expect(Array.from(store.getBindings())).to.deep.equal([binding, otherBinding1]);

    store.removeBinding(binding);
    store.removeBinding(otherBinding2);

    expect(Array.from(store.getBindings())).to.deep.equal([otherBinding1]);
  });

  it('should execute various components operations on store', () => {
    const items: StoreItem[] = [];
    tools.injectConfig({ store: { type: 'memory', items } });
    const store = new Store();

    const component = { id: 'my-comp', plugin: 'my-plugin', config: { toto: 42 } };
    store.setComponent(component);

    expect(Array.from(store.getComponents())).to.deep.equal([component]);

    store.removeComponent('my-comp');

    expect(Array.from(store.getComponents())).to.deep.equal([]);

    const otherComponent1 = { ...component, plugin: 'my-plugin1' };
    const otherComponent2 = { ...component, id: 'my-comp2' };
    store.setComponent(component);
    store.setComponent(otherComponent1);
    store.setComponent(otherComponent2);

    expect(Array.from(store.getComponents())).to.deep.equal([otherComponent1, otherComponent2]);
  });

  it('should load and save', async () => {
    const items: StoreItem[] = [];
    tools.injectConfig({ store: { type: 'memory', items } });
    const store = new Store();

    await store.load();

    expect(Array.from(store.getComponents())).to.deep.equal([]);

    const component = { id: 'my-comp', plugin: 'my-plugin', config: { toto: 42 } };
    store.setComponent(component);

    expect(items).to.deep.equal([]);

    await store.save();

    expect(items).to.deep.equal([{ type: 'component', config: component }]);
    expect(Array.from(store.getComponents())).to.deep.equal([component]);

    tools.injectConfig({ store: { type: 'memory', items } });
    const otherStore = new Store();

    await otherStore.load();

    expect(Array.from(store.getComponents())).to.deep.equal([component]);
  });
});
