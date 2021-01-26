import deepEqual from 'deep-equal';
import { components } from 'mylife-home-common';
import { Member, MemberType } from '../../../../shared/component-model';

// input = clazz
export function convertPluginMembers(input: string) {
  const members: { [name: string]: Member; } = {};

  const inputMembers = input.split('|').filter(item => item);
  for (const inputMember of inputMembers) {
    const [name, inputType] = inputMember.substr(1).split(',');
    const valueType = convertType(inputType);
    const memberType = convertMemberType(inputMember[0]);

    members[name] = {
      memberType,
      valueType: valueType.toString(),
      description: null, // v1 model has no description
    };
  }

  return members;
}

function convertType(input: string) {
  // type can be null in old model (ui button actions), we switch to boolean
  if (!input) {
    return new components.metadata.Bool();
  }

  // https://github.com/mylife-home/mylife-home-core/blob/master/lib/metadata/type.js

  if (input.startsWith('[') && input.endsWith(']')) {
    const trimmed = input.substr(1, input.length - 2);
    const parts = trimmed.split(';');
    if (parts.length !== 2) {
      throw new Error(`Invalid type: ${input}`);
    }

    const min = parseInt(parts[0]);
    const max = parseInt(parts[1]);

    return new components.metadata.Range(min, max);
  }

  if (input.startsWith('{') && input.endsWith('}')) {
    const trimmed = input.substr(1, input.length - 2);
    const parts = trimmed.split(';');
    parts.sort();

    if (isSameEnum(parts, ['off', 'on'])) {
      // consider it is ported as boolean now
      return new components.metadata.Bool();
    }

    return new components.metadata.Enum(...parts);
  }

  throw new Error(`Invalid type: ${input}`);
}

function isSameEnum(enum1: string[], enum2: string[]) {
  const e1 = enum1.slice().sort();
  const e2 = enum2.slice().sort();
  return deepEqual(e1, e2);
}

function convertMemberType(input: string) {
  switch (input) {
    case '=':
      return MemberType.STATE;
    case '.':
      return MemberType.ACTION;
    default: throw new Error(`Unsupported member type: ${input}`);
  }
}
