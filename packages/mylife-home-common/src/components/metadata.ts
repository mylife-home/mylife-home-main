export const enum NetType {
  STRING = 'string',
  BOOL = 'bool',
  UINT8 = 'uint8',
  INT8 = 'int8',
  UINT32 = 'uint32',
  INT32 = 'int32',
  FLOAT = 'float',
}

export const enum NetMemberType {
  ACTION = 'action',
  STATE = 'state',
}

export interface NetMemberDescriptor {
  readonly member: NetMemberType;
  readonly type: NetType;
}

export interface NetComponentDescriptor {
  readonly name: string;
  readonly members: { [name: string]: NetMemberDescriptor; };
}
