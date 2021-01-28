export interface Type {
  typeId: 'range' | 'text' | 'float' | 'bool' | 'enum' | 'complex';
}

export interface Range extends Type {
  typeId: 'range';
  min: number;
  max: number;
}

export interface Enum extends Type {
  typeId: 'enum';
  values: string[];
}

// simplified version of common/components/metadata/types

const parser = /([a-z]+)(.*)/;
const rangeParser = /\[(-?\d+);(-?\d+)\]/;
const enumParser = /{(.[\w_\-,]+)}/;

export function parseType(value: string): Type {
  const [type, args] = runRegex(parser, value, value);

  switch (type) {
    case 'range': {
      const [min, max] = runRegex(rangeParser, args, value);
      const rangeType: Range = { typeId: 'range', min: Number.parseInt(min), max: Number.parseInt(max) };
      return rangeType;
    }

    case 'text':
      return { typeId: 'text' };

    case 'float':
      return { typeId: 'float' };

    case 'bool':
      return { typeId: 'bool' };

    case 'enum': {
      const [values] = runRegex(enumParser, args, value);
      const enumType: Enum = { typeId: 'enum', values: values.split(',') };
      return enumType;
    }

    case 'complex':
      return { typeId: 'complex' };

    default:
      throw new Error(`Unknown type: '${type}'`);
  }
}

function runRegex(regex: RegExp, input: string, inputType: string) {
  const result = input.match(regex);
  const [full, ...output] = result;
  return output;
}
