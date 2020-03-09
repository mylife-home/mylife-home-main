import 'mocha';
import { expect } from 'chai';
import sinon from 'sinon';
import * as encoding from '../../src/bus/encoding';
import { MqttTestSession, sleep } from './tools';

describe('bus/logger', () => {
  it('should stream data between 2 instances', async () => {
    const session = new MqttTestSession();
    await session.init();
    try {

      const source = await session.createTransport('source');
      const destination = await session.createTransport('destination');

      const destStream = destination.logger.createAggregatedReadableStream();

      const handler = sinon.fake();
      destStream.on('data', handler);

      const sourceStream = source.logger.createWritableStream();
      await sleep(20);

      sourceStream.write(Buffer.from('abc'));
      await sleep(20);

      sourceStream.write(Buffer.from('def'));
      await sleep(20);

      expect(handler.calledTwice).to.be.true;
      expect(handler.getCall(0).args[0]).to.deep.equal(Buffer.from('abc'));
      expect(handler.getCall(1).args[0]).to.deep.equal(Buffer.from('def'));

    } finally {
      await session.terminate();
    }
  });

  it('should stream data from multiple instances to one target', async () => {
    const session = new MqttTestSession();
    await session.init();
    try {

      const source1 = await session.createTransport('source1');
      const source2 = await session.createTransport('source2');
      const destination = await session.createTransport('destination');

      const destStream = destination.logger.createAggregatedReadableStream();

      const handler = sinon.fake();
      destStream.on('data', handler);

      const sourceStream1 = source1.logger.createWritableStream();
      const sourceStream2 = source2.logger.createWritableStream();
      await sleep(20);

      sourceStream1.write(Buffer.from('abc'));
      await sleep(20);

      sourceStream2.write(Buffer.from('def'));
      await sleep(20);

      expect(handler.calledTwice).to.be.true;
      expect(handler.getCall(0).args[0]).to.deep.equal(Buffer.from('abc'));
      expect(handler.getCall(1).args[0]).to.deep.equal(Buffer.from('def'));

    } finally {
      await session.terminate();
    }
  });

  it('should keep data to emit when disconnected', async () => {
    const session = new MqttTestSession();
    await session.init();
    try {


      const source = await session.createTransport('source');
      const destination = await session.createTransport('destination');

      const destStream = destination.logger.createAggregatedReadableStream();

      const handler = sinon.fake();
      destStream.on('data', handler);

      await session.disconnectTransport('source');

      const sourceStream = source.logger.createWritableStream();
      await sleep(20);

      sourceStream.write(Buffer.from('abc'));
      await sleep(20);

      sourceStream.write(Buffer.from('def'));
      await sleep(20);

      await session.reconnectTransport('source');
      await sleep(20);

      expect(handler.calledTwice).to.be.true;
      expect(handler.getCall(0).args[0]).to.deep.equal(Buffer.from('abc'));
      expect(handler.getCall(1).args[0]).to.deep.equal(Buffer.from('def'));
    } finally {
      await session.terminate();
    }
  });

  it('should drop data if too much when disconnected', async () => {
    const session = new MqttTestSession();
    await session.init();
    try {

      const source = await session.createTransport('source', { loggerOfflineRetention: 2 }); // 2 bytes
      const destination = await session.createTransport('destination');

      const destStream = destination.logger.createAggregatedReadableStream();

      const handler = sinon.fake();
      destStream.on('data', handler);

      await session.disconnectTransport('source');

      const sourceStream = source.logger.createWritableStream();
      await sleep(20);

      sourceStream.write(Buffer.from('abc'));
      await sleep(20);

      sourceStream.write(Buffer.from('def'));
      await sleep(20);

      await session.reconnectTransport('source');
      await sleep(20);

      expect(handler.calledOnce).to.be.true;
      expect(handler.getCall(0).args[0]).to.deep.equal(Buffer.from('abc'));
      // second buffer dropped
    } finally {
      await session.terminate();
    }
  });
});
