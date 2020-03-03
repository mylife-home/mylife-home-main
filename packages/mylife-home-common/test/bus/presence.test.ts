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
      tester.presence.on('instanceChange', spy);

      const other = await session.createTransport('other');
      await sleep(20);

      expect(tester.presence.getOnlines()).to.deep.equal(['other']);
      expect(spy.calledOnce);
      expect(spy.lastCall.args).to.deep.equal(['other', true]);

      spy.resetHistory();
      await session.closeTransport(other);
      await sleep(20);

      expect(tester.presence.getOnlines()).to.deep.equal([]);
      expect(spy.calledOnce);
      expect(spy.lastCall.args).to.deep.equal(['other', false]);

    } finally {
      await session.terminate();
    }
  });
});

async function sleep(delay: number) {
  return new Promise<void>(resolve => setTimeout(resolve, delay));
}