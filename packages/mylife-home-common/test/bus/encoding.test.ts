import 'mocha';
import { expect } from 'chai';
import * as encoding from '../../src/bus/encoding';

describe('bus/encoding', () => {
  it('should encode bool (true)', () => {
    const buffer = encoding.writeBool(true);
    expect(buffer.toString('hex')).to.equal('01');
  });

  it('should encode bool (false)', () => {
    const buffer = encoding.writeBool(false);
    expect(buffer.toString('hex')).to.equal('00');
  });

  it('should decode bool (01)', () => {
    const buffer = Buffer.from('01', 'hex');
    const value = encoding.readBool(buffer);
    expect(value).to.equal(true);
  });

  it('should decode bool (02)', () => {
    const buffer = Buffer.from('02', 'hex');
    const value = encoding.readBool(buffer);
    expect(value).to.equal(true);
  });

  it('should decode bool (00)', () => {
    const buffer = Buffer.from('00', 'hex');
    const value = encoding.readBool(buffer);
    expect(value).to.equal(false);
  });

  it('should encode json', () => {
    const buffer = encoding.writeJson({ foo: 'bar' });
    expect(buffer.toString()).to.equal('{"foo":"bar"}');
  });

  it('should decode json', () => {
    const buffer = Buffer.from('{"foo":"bar"}');
    const value = encoding.readJson(buffer);
    expect(value).to.deep.equal({ foo: 'bar' });
  });
});
