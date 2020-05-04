import 'mocha';
import { expect } from 'chai';
import * as types from '../../src/components/metadata/types';

describe('components/metadata', () => {
  it('should parse range type', () => parserTest('range[1;2]'));
  it('should parse range type with negative bound', () => parserTest('range[-2;-1]'));
  it('should parse text type', () => parserTest('text'));
  it('should parse float type', () => parserTest('float'));
  it('should parse bool type', () => parserTest('bool'));
  it('should parse enum type', () => parserTest('enum{a,b,c}'));

  // TODO: test wrong type, wrong range/enum values

  function parserTest(value: string) {
    const type = types.parseType(value);
    expect(type.toString()).to.equals(value);
  }

});
