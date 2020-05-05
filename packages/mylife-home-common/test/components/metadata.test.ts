import 'mocha';
import { expect } from 'chai';
import * as metadata from '../../src/components/metadata';

describe('components/metadata', () => {

  describe('types', () => {
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
      const type = metadata.parseType(value);
      expect(type.toString()).to.equals(value);
    }

    function parserTestFail(value: string, expectedError: string | RegExp) {
      expect(() => metadata.parseType(value)).to.throw(expectedError);
    }

    it('should build type text', () => testTrivialType(new metadata.Text(), 'string', 'text'));
    it('should build type float', () => testTrivialType(new metadata.Float(), 'float', 'float'));
    it('should build type bool', () => testTrivialType(new metadata.Bool(), 'bool', 'bool'));
    it('should build type complex', () => testTrivialType(new metadata.Complex(), 'json', 'complex'));

    it('should build type range[1;2]', () => testRangeType(1, 2, 'uint8'));
    it('should build type range[-1;0]', () => testRangeType(-1, 0, 'int8'));
    it('should build type range[0;5000]', () => testRangeType(0, 5000, 'uint32'));
    it('should build type range[-1;5000]', () => testRangeType(-1, 5000, 'int32'));
    it('should fail to build type range[2;1]', () => expect(() => new metadata.Range(2, 1)).to.throw('Min >= max for range: min=2, max=1'));
    it('should fail to build type range[0;1.1]', () => expect(() => new metadata.Range(0, 1.1)).to.throw('Bad max value for range: 1.1'));
    it('should fail to build type range[0;5000000000]', () => expect(() => new metadata.Range(0, 5000000000)).to.throw('Cannot represent range type with min=0 and max=5000000000 because bounds are too big'));
    it('should fail to build type range[-5000000000;0]', () => expect(() => new metadata.Range(-5000000000, 0)).to.throw('Cannot represent range type with min=-5000000000 and max=0 because bounds are too big'));

    it('should build type enum{a,b}', () => testEnumType('a', 'b'));
    it('should build type enum{a-b-c,b}', () => testEnumType('a-b-c', 'b'));
    it('should build type enum{a_b_c,b}', () => testEnumType('a_b_c', 'b'));
    it('should build type enum{ABC,DEF}', () => testEnumType('ABC', 'DEF'));
    it('should fail to build type enum{a}', () => expect(() => new metadata.Enum('a')).to.throw('Cannot build an enum without at least 2 values'));
    it('should fail to build type enum{}', () => expect(() => new metadata.Enum()).to.throw('Cannot build an enum without at least 2 values'));

    function testTrivialType(type: metadata.Type, expectedPrimitive: string, expectedToString: string) {
      expect(type.primitive.id).to.equal(expectedPrimitive);
      expect(type.toString()).to.equal(expectedToString);
    }

    function testRangeType(min: number, max: number, expectedPrimitive: string) {
      const type = new metadata.Range(min, max);
      expect(type.min).to.equal(min);
      expect(type.max).to.equal(max);
      expect(type.primitive.id).to.equal(expectedPrimitive);
      expect(type.toString()).to.equal(`range[${min};${max}]`);
    }

    function testEnumType(...values: string[]) {
      const type = new metadata.Enum(...values);
      expect(type.values).to.deep.equal(values);
      expect(type.primitive.id).to.equal('string');
      expect(type.toString()).to.equal(`enum{${values.join(',')}}`);
    }
  });
});
