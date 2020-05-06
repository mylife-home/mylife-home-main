import { encoding } from '../../bus';

export interface Primitive {
  readonly id: string;

  encode(value: any): Buffer;
  decode(data: Buffer): any;
}

export namespace Primitives {
  export const STRING: Primitive = { id: 'string', encode: encoding.writeString, decode: encoding.readString };
  export const BOOL: Primitive = { id: 'bool', encode: encoding.writeBool, decode: encoding.readBool };
  export const UINT8: Primitive = { id: 'uint8', encode: encoding.writeUInt8, decode: encoding.readUInt8 };
  export const INT8: Primitive = { id: 'int8', encode: encoding.writeInt8, decode: encoding.readInt8 };
  export const UINT32: Primitive = { id: 'uint32', encode: encoding.writeUInt32, decode: encoding.readUInt32 };
  export const INT32: Primitive = { id: 'int32', encode: encoding.writeInt32, decode: encoding.readInt32 };
  export const FLOAT: Primitive = { id: 'float', encode: encoding.writeFloat, decode: encoding.readFloat };
  export const JSON: Primitive = { id: 'json', encode: encoding.writeJson, decode: encoding.readJson };
}

export interface Type {
  readonly primitive: Primitive;
  toString(): string;
  validate(value: any): void;
}

const parser = /([a-z]+)(.*)/;
const rangeParser = /\[(-?\d+);(-?\d+)\]/;
const enumParser = /{(.[\w_\-,]+)}/;

export function parseType(value: string): Type {
  const [type, args] = runRegex(parser, value, value);

  switch (type) {
    case 'range': {
      const [min, max] = runRegex(rangeParser, args, value);
      return new Range(Number.parseInt(min), Number.parseInt(max));
    }

    case 'text':
      checkNoArgs(args, type);
      return new Text();

    case 'float':
      checkNoArgs(args, type);
      return new Float();

    case 'bool':
      checkNoArgs(args, type);
      return new Bool();

    case 'enum': {
      const [values] = runRegex(enumParser, args, value);
      if (!values) {
        throw new Error('Bad values for enum');
      }
      return new Enum(...values.split(','));
    }

    case 'complex':
      checkNoArgs(args, type);
      return new Complex();

    default:
      throw new Error(`Unknown type: '${type}'`);
  }
}

function runRegex(regex: RegExp, input: string, inputType: string) {
  const result = input.match(regex);
  if (!result) {
    throw new Error(`Invalid type: '${inputType}'`);
  }

  const [full, ...output] = result;
  return output;
}

function checkNoArgs(args: string, type: string) {
  if (args) {
    throw new Error(`Type '${type}' requires no argument but got '${args}'`);
  }
}

const INT8_MIN = -128;
const INT8_MAX = 127;
const UINT8_MAX = 255;
const INT32_MIN = -2147483648;
const INT32_MAX = 2147483647;
const UINT32_MAX = 4294967295;

export class Range implements Type {
  public readonly primitive: Primitive;
  constructor(public readonly min: number, public readonly max: number) {
    if (!Number.isInteger(min)) {
      throw new Error(`Bad min value for range: ${min}`);
    }

    if (!Number.isInteger(max)) {
      throw new Error(`Bad max value for range: ${max}`);
    }

    if (min >= max) {
      throw new Error(`Min >= max for range: min=${min}, max=${max}`);
    }

    this.primitive = computePrimitive(min, max);
  }

  toString() {
    return `range[${this.min};${this.max}]`;
  }

  validate(value: any) {
    if (!Number.isInteger(value) || value < this.min || value > this.max) {
      throw new Error(`Wrong value '${value}' for type '${this.toString()}'`);
    }
  }
}

function computePrimitive(min: number, max: number) {
  if (min >= 0 && max <= UINT8_MAX) {
    return Primitives.UINT8;
  }

  if (min >= INT8_MIN && max <= INT8_MAX) {
    return Primitives.INT8;
  }

  if (min >= 0 && max <= UINT32_MAX) {
    return Primitives.UINT32;
  }

  if (min >= INT32_MIN && max <= INT32_MAX) {
    return Primitives.INT32;
  }

  throw new Error(`Cannot represent range type with min=${min} and max=${max} because bounds are too big`);
}

export class Text implements Type {
  toString() {
    return 'text';
  }

  get primitive() {
    return Primitives.STRING;
  }

  validate(value: any) {
    if (typeof value !== 'string') {
      throw new Error(`Wrong value '${value}' for type '${this.toString()}'`);
    }
  }
}

export class Float implements Type {
  toString() {
    return 'float';
  }

  get primitive() {
    return Primitives.FLOAT;
  }

  validate(value: any) {
    if (typeof value !== 'number') {
      throw new Error(`Wrong value '${value}' for type '${this.toString()}'`);
    }
  }
}

export class Bool implements Type {
  toString() {
    return 'bool';
  }

  get primitive() {
    return Primitives.BOOL;
  }

  validate(value: any) {
    if (typeof value !== 'boolean') {
      throw new Error(`Wrong value '${value}' for type '${this.toString()}'`);
    }
  }
}

export class Enum implements Type {
  public readonly values: readonly string[];

  constructor(...values: string[]) {
    if (values.length < 2) {
      throw new Error('Cannot build an enum without at least 2 values');
    }
    this.values = values;
  }

  toString() {
    return `enum{${this.values.join(',')}}`;
  }

  get primitive() {
    return Primitives.STRING;
  }

  validate(value: any) {
    if (!this.values.includes(value)) {
      throw new Error(`Wrong value '${value}' for type '${this.toString()}'`);
    }
  }
}

export class Complex implements Type {
  toString() {
    return 'complex';
  }

  get primitive() {
    return Primitives.JSON;
  }

  validate(value: any) {
    // let's consider all is valid
  }
}
