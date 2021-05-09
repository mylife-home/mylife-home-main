import * as types from '../../store/core-designer/types';
import { BindingSource } from './main-view/binding-dnd';

export interface BindingHalf {
  componentId: string;
  memberName: string;
}

export function createBindingData(componentId: string, memberName: string, memberType: types.MemberType, newValue: BindingHalf) {
  switch (memberType) {
    case types.MemberType.STATE: {
      const bindingData: types.CoreBindingData = {
        sourceComponent: componentId,
        sourceState: memberName,
        targetComponent: newValue.componentId,
        targetAction: newValue.memberName,
      };

      return bindingData;
    }

    case types.MemberType.STATE: {
      const bindingData: types.CoreBindingData = {
        sourceComponent: newValue.componentId,
        sourceState: newValue.memberName,
        targetComponent: componentId,
        targetAction: memberName,
      };

      return bindingData;
    }

    default:
      throw new Error(`Unsupported member type: '${memberType}'`);
  }
}

export function isBindingTarget(source: BindingSource, target: BindingSource) {
  // cannot bind on same component
  if (source.componentId === target.componentId) {
    return false;
  }

  return source.memberType !== target.memberType && source.valueType === target.valueType;
}