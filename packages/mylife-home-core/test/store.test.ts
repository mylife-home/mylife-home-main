import 'mocha';
import { expect } from 'chai';
import { MemoryStoreOperations, Store } from '../src/store';

describe('store', () => {
  it('should execute various binding operations on store', () => {
    const operations = new MemoryStoreOperations();
    const store = new Store(operations);

    const binding = { sourceId: 'sourceId', sourceState: 'sourceState', targetId: 'targetId', targetAction: 'targetAction' };
    store.addBinding(binding);

    expect(Array.from(store.getBindings())).to.deep.equal([binding]);

    store.removeBinding(binding);
    expect(Array.from(store.getBindings())).to.deep.equal([]);

    const otherBinding1 = { sourceId: 'other1', sourceState: 'sourceState', targetId: 'targetId', targetAction: 'targetAction' };
    const otherBinding2 = { sourceId: 'other2', sourceState: 'sourceState', targetId: 'targetId', targetAction: 'targetAction' };
    store.addBinding(binding);
    store.addBinding(binding);
    store.addBinding(otherBinding1);

    expect(Array.from(store.getBindings())).to.deep.equal([binding, otherBinding1]);

    store.removeBinding(binding);
    store.removeBinding(otherBinding2);

    expect(Array.from(store.getBindings())).to.deep.equal([otherBinding1]);
  });

  it('should execute various components operations on store', () => {
    const operations = new MemoryStoreOperations();
    const store = new Store(operations);

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
    const operations = new MemoryStoreOperations();
    const store = new Store(operations);

    await store.load();

    expect(Array.from(store.getComponents())).to.deep.equal([]);

    const component = { id: 'my-comp', plugin: 'my-plugin', config: { toto: 42 } };
    store.setComponent(component);

    expect(operations.items).to.deep.equal([]);

    await store.save();

    expect(operations.items).to.deep.equal([{ type: 'component', config: component }]);
    expect(Array.from(store.getComponents())).to.deep.equal([component]);

    const otherOperations = new MemoryStoreOperations();
    const otherStore = new Store(otherOperations);
    otherOperations.items = operations.items;

    await otherStore.load();

    expect(Array.from(store.getComponents())).to.deep.equal([component]);
  });
});
