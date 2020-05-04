import 'mocha';
import { expect } from 'chai';
import * as types from '../../src/components/metadata/types';

describe('components/metadata', () => {
  it('should parse type', async () => {
    const type = types.parseType('range[1;2]');
    expect(type).to.be.an.instanceof(types.Range);
    expect(type.primitive).to.equal(types.Primitive.UINT8);
    expect(type.toString()).to.equals('range[1;2]');
  });

});
