export const enum NetType {
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
  readonly type: NetType;
}

export interface ComponentDescriptor {
  readonly name: string;
  readonly members: { [name: string]: MemberDescriptor; };
}
