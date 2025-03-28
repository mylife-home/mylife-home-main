import 'mocha';
import { expect } from 'chai';
import sinon from 'sinon';
import { tools } from '../../src/main';
import { MqttTestSession } from './tools';

describe('bus/presence', () => {
  it('should see presence of another instance', async () => {
    const session = new MqttTestSession();
    await session.init();
    try {

      const spy = sinon.fake();
      const tester = await session.createTransport('tester', { presenceTracking: true });
      tester.presence.on('instanceChange', spy);

      const other = await session.createTransport('other');
      await tools.sleep(20);

      expect(tester.presence.getOnlines()).to.deep.equal(['other']);
      expect(spy.calledOnce);
      expect(spy.lastCall.args).to.deep.equal(['other', true]);

      spy.resetHistory();
      await session.closeTransport('other');
      await tools.sleep(20);

      expect(tester.presence.getOnlines()).to.deep.equal([]);
      expect(spy.calledOnce);
      expect(spy.lastCall.args).to.deep.equal(['other', false]);

    } finally {
      await session.terminate();
    }
  });

  it('should handle other disconnection', async () => {
    const session = new MqttTestSession();
    await session.init();
    try {

      const spy = sinon.fake();
      const tester = await session.createTransport('tester', { presenceTracking: true });
      tester.presence.on('instanceChange', spy);

      await session.createTransport('other');
      await tools.sleep(20);

      expect(tester.presence.getOnlines()).to.deep.equal(['other']);
      expect(spy.calledOnce);
      expect(spy.lastCall.args).to.deep.equal(['other', true]);

      spy.resetHistory();
      await session.disconnectTransport('other');
      await tools.sleep(20);

      expect(tester.presence.getOnlines()).to.deep.equal([]);
      expect(spy.calledOnce);
      expect(spy.lastCall.args).to.deep.equal(['other', false]);

      spy.resetHistory();
      await session.reconnectTransport('other');
      await tools.sleep(20);

      expect(tester.presence.getOnlines()).to.deep.equal(['other']);
      expect(spy.calledOnce);
      expect(spy.lastCall.args).to.deep.equal(['other', true]);

    } finally {
      await session.terminate();
    }
  });

  it('should handle other disconnection gracefully', async () => {
    const session = new MqttTestSession();
    await session.init();
    try {

      const spy = sinon.fake();
      const tester = await session.createTransport('tester', { presenceTracking: true });
      tester.presence.on('instanceChange', spy);

      await session.createTransport('other');
      await tools.sleep(20);

      expect(tester.presence.getOnlines()).to.deep.equal(['other']);
      expect(spy.calledOnce);
      expect(spy.lastCall.args).to.deep.equal(['other', true]);

      spy.resetHistory();
      await session.closeTransport('other');
      await tools.sleep(20);

      expect(tester.presence.getOnlines()).to.deep.equal([]);
      expect(spy.calledOnce);
      expect(spy.lastCall.args).to.deep.equal(['other', false]);

    } finally {
      await session.terminate();
    }
  });

  it('should handle self disconnection', async () => {
    const session = new MqttTestSession();
    await session.init();
    try {

      const spy = sinon.fake();
      const tester = await session.createTransport('tester', { presenceTracking: true });
      tester.presence.on('instanceChange', spy);

      await session.createTransport('other');
      await tools.sleep(20);

      expect(tester.presence.getOnlines()).to.deep.equal(['other']);
      expect(spy.calledOnce);
      expect(spy.lastCall.args).to.deep.equal(['other', true]);

      spy.resetHistory();
      await session.disconnectTransport('tester');
      await tools.sleep(20);

      expect(tester.presence.getOnlines()).to.deep.equal([]);
      expect(spy.calledOnce);
      expect(spy.lastCall.args).to.deep.equal(['other', false]);

      spy.resetHistory();
      await session.reconnectTransport('tester');
      await tools.sleep(20);

      expect(tester.presence.getOnlines()).to.deep.equal(['other']);
      expect(spy.calledOnce);
      expect(spy.lastCall.args).to.deep.equal(['other', true]);

    } finally {
      await session.terminate();
    }
  });
});
