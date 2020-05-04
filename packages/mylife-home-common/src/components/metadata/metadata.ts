export const enum Primitive {
  STRING = 'string',
  BOOL = 'bool',
  UINT8 = 'uint8',
  INT8 = 'int8',
  UINT32 = 'uint32',
  INT32 = 'int32',
  FLOAT = 'float',
}

export const enum MemberType {
  ACTION = 'action',
  STATE = 'state',
}

export interface MemberDescriptor {
  readonly member: MemberType;
  readonly type: Type;
}

export interface ComponentDescriptor {
  readonly name: string;
  readonly members: { [name: string]: MemberDescriptor; };
}

interface Type {
  readonly primitive: Primitive;
  toString(): string;
}

function parseType(value: string): Type {

}

class Range implements Type {
  constructor(min, max) {

  }
}

class Text implements Type {

}

class Float implements Type {

}

class Bool implements Type {

}

class Enum implements Type {
  constructor(...values) {

  }
}