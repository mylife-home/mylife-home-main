export enum Type {
  STRING = 'string',
  BOOL = 'bool',
  UINT8 = 'uint8',
  INT8 = 'int8',
  UINT32 = 'uint32',
  INT32 = 'int32',
  FLOAT = 'float',
}

export function getPrimitive(type: Type): string {
  switch (type) {
    case Type.STRING:
      return 'String';
    case Type.BOOL:
      return 'Boolean';
    case Type.UINT8:
    case Type.INT8:
    case Type.UINT32:
    case Type.INT32:
    case Type.FLOAT:
      return 'Number';
    default:
      throw new Error(`Unsupported type '${type}'`);
  }
}

export function getDefaultType(primitive: string) : Type {
  switch (primitive) {
    case 'String':
      return Type.STRING;
    case 'Boolean':
      return Type.BOOL;
    case 'Number':
      return Type.FLOAT;
    default:
      throw new Error(`Unsupported primitive '${primitive}'`);
  }
}
