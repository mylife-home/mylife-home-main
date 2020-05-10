import 'mocha';
import { expect } from 'chai';
import sinon from 'sinon';
import { tools } from '../../src/main';
import { MqttTestSession } from './tools';

describe('bus/metadata', () => {
  it('should set and clear local metadata', async () => {
    const session = new MqttTestSession();
    await session.init();
    try {

      const server = await session.createTransport('server');

      server.metadata.set('test', { value: 42 });
      await tools.sleep(20);
      server.metadata.clear('test');
      await tools.sleep(20);

    } finally {
      await session.terminate();
    }
  });

  it('should listen to remote metadata', async () => {
    const session = new MqttTestSession();
    await session.init();
    try {

      const server = await session.createTransport('server');
      const client = await session.createTransport('client');

      server.metadata.set('test', { value: 42 });
      await tools.sleep(20);

      const view = await client.metadata.createView('server');
      await tools.sleep(20);

      expect(Array.from(view.paths)).to.deep.equal(['test']);
      expect(view.getValue('test')).to.deep.equal({ value: 42 });

      const setHandler = sinon.fake();
      const clearHandler = sinon.fake();
      view.on('set', setHandler);
      view.on('clear', clearHandler);

      server.metadata.set('test', { value: 43 });
      await tools.sleep(20);

      expect(Array.from(view.paths)).to.deep.equal(['test']);
      expect(view.getValue('test')).to.deep.equal({ value: 43 });
      expect(setHandler.calledOnce).to.be.true;
      expect(setHandler.lastCall.args).to.deep.equal(['test', { value: 43 }]);
      expect(clearHandler.called).to.be.false;

      setHandler.resetHistory();
      clearHandler.resetHistory();

      server.metadata.clear('test');
      await tools.sleep(20);

      expect(Array.from(view.paths)).to.deep.equal([]);
      expect(setHandler.called).to.be.false;
      expect(clearHandler.calledOnce).to.be.true;
      expect(clearHandler.lastCall.args).to.deep.equal(['test']);

      await client.metadata.closeView(view);

    } finally {
      await session.terminate();
    }
  });
});
