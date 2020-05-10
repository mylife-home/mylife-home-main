import 'mocha';
import { expect } from 'chai';
import { tools } from '../../src/main';
import { MqttTestSession } from './tools';

describe('bus/client', () => {
  it('should clean resident state on connection', async () => {
    const session = new MqttTestSession();
    await session.init();
    try {
      const observer = await session.createTransport('observer');

      const tester1 = await session.createTransport('tester');
      await tester1.metadata.set('garbage', true);
      await expectMetaPaths(['garbage']);
      await session.closeTransport('tester');

      await session.createTransport('tester');
      await expectMetaPaths([]);

      async function expectMetaPaths(expectedPaths: string[]) {
        const meta = await observer.metadata.createView('tester');
        await tools.sleep(20);
        expect(Array.from(meta.paths)).to.deep.equal(expectedPaths);
        await observer.metadata.closeView(meta);
      }
    } finally {
      await session.terminate();
    }
  });
});
