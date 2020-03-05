import 'mocha';
import { expect } from 'chai';
import sinon from 'sinon';
import { MqttTestSession } from './tools';

describe('bus/presence', () => {
  it('should see presence of another instance', async () => {
    const session = new MqttTestSession();
    await session.init();
    try {

      const spy = sinon.fake();
      const tester = await session.createTransport('tester');
      tester.presence.track = true;
      tester.presence.on('instanceChange', spy);

      const other = await session.createTransport('other');
      await sleep(20);

      expect(tester.presence.getOnlines()).to.deep.equal(['other']);
      expect(spy.calledOnce);
      expect(spy.lastCall.args).to.deep.equal(['other', true]);

      spy.resetHistory();
      await session.closeTransport('other');
      await sleep(20);

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
      const tester = await session.createTransport('tester');
      tester.presence.track = true;
      tester.presence.on('instanceChange', spy);

      await session.createTransport('other');
      await sleep(20);

      expect(tester.presence.getOnlines()).to.deep.equal(['other']);
      expect(spy.calledOnce);
      expect(spy.lastCall.args).to.deep.equal(['other', true]);

      spy.resetHistory();
      await session.disconnectTransport('other');
      await sleep(20);

      expect(tester.presence.getOnlines()).to.deep.equal([]);
      expect(spy.calledOnce);
      expect(spy.lastCall.args).to.deep.equal(['other', false]);

      spy.resetHistory();
      await session.reconnectTransport('other');
      await sleep(20);

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
      const tester = await session.createTransport('tester');
      tester.presence.track = true;
      tester.presence.on('instanceChange', spy);

      await session.createTransport('other');
      await sleep(20);

      expect(tester.presence.getOnlines()).to.deep.equal(['other']);
      expect(spy.calledOnce);
      expect(spy.lastCall.args).to.deep.equal(['other', true]);

      spy.resetHistory();
      await session.closeTransport('other');
      await sleep(20);

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
      const tester = await session.createTransport('tester');
      tester.presence.track = true;
      tester.presence.on('instanceChange', spy);

      await session.createTransport('other');
      await sleep(20);

      expect(tester.presence.getOnlines()).to.deep.equal(['other']);
      expect(spy.calledOnce);
      expect(spy.lastCall.args).to.deep.equal(['other', true]);

      spy.resetHistory();
      await session.disconnectTransport('tester');
      await sleep(20);

      expect(tester.presence.getOnlines()).to.deep.equal([]);
      expect(spy.calledOnce);
      expect(spy.lastCall.args).to.deep.equal(['other', false]);

      spy.resetHistory();
      await session.reconnectTransport('tester');
      await sleep(20);

      expect(tester.presence.getOnlines()).to.deep.equal(['other']);
      expect(spy.calledOnce);
      expect(spy.lastCall.args).to.deep.equal(['other', true]);

    } finally {
      await session.terminate();
    }
  });
});

async function sleep(delay: number) {
  return new Promise<void>(resolve => setTimeout(resolve, delay));
}