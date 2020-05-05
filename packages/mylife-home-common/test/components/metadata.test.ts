import 'mocha';
import { expect } from 'chai';
import * as types from '../../src/components/metadata/types';

describe('components/metadata', () => {
  it('should parse text type', () => parserTest('text'));
  it('should parse float type', () => parserTest('float'));
  it('should parse bool type', () => parserTest('bool'));
  it('should parse complex type', () => parserTest('complex'));

  it('should parse range type', () => parserTest('range[1;2]'));
  it('should parse range type with negative bound', () => parserTest('range[-2;-1]'));
  it('should fail to parse ill-formatted range', () => parserTestFail('range-fdsa', `Invalid type: 'range-fdsa'`));
  it('should fail to parse ill-formatted range arguemnts', () => parserTestFail('range[a;b]', `Invalid type: 'range[a;b]'`));

  it('should parse enum type', () => parserTest('enum{a,b,c}'));
  it('should fail to parse ill-formatted enum', () => parserTestFail('enum-fdsa', `Invalid type: 'enum-fdsa'`));
  it('should fail to parse ill-formatted enum arguments', () => parserTestFail('enum{a43?><}', `Invalid type: 'enum{a43?><}'`));
  it('should fail to parse empty enum arguments', () => parserTestFail('enum{}', `Invalid type: 'enum{}'`));

  it('should fail to parse unknown type', () => parserTestFail('toto', `Unknown type: 'toto'`));
  it('should fail to parse garbage', () => parserTestFail('toto-abc', `Unknown type: 'toto'`));
  it('should fail to parse type with unrequired args', () => parserTestFail('bool-abc', `Type 'bool' requires no argument but got '-abc'`));

  function parserTest(value: string) {
    const type = types.parseType(value);
    expect(type.toString()).to.equals(value);
  }

  function parserTestFail(value: string, expectedError: string | RegExp) {
    expect(() => types.parseType(value)).to.throw(expectedError);
  }

});
