export enum NetType {
  STRING = 'string',
  BOOL = 'bool',
  UINT8 = 'uint8',
  INT8 = 'int8',
  UINT32 = 'uint32',
  INT32 = 'int32',
  FLOAT = 'float',
}

export enum ConfigType {
  STRING = 'string',
  BOOL = 'bool',
  INTEGER = 'integer',
  FLOAT = 'float',
}

export function getPrimitive(type: NetType): string {
  switch (type) {
    case NetType.STRING:
      return 'String';
    case NetType.BOOL:
      return 'Boolean';
    case NetType.UINT8:
    case NetType.INT8:
    case NetType.UINT32:
    case NetType.INT32:
    case NetType.FLOAT:
      return 'Number';
    default:
      throw new Error(`Unsupported type '${type}'`);
  }
}

export function getDefaultType(primitive: string) : NetType {
  switch (primitive) {
    case 'String':
      return NetType.STRING;
    case 'Boolean':
      return NetType.BOOL;
    case 'Number':
      return NetType.FLOAT;
    default:
      throw new Error(`Unsupported primitive '${primitive}'`);
  }
}
