import * as types from '../../store/core-designer/types';
import { BindingSource } from './main-view/binding-dnd';

export function createBindingData(componentId: string, memberName: string, memberType: types.MemberType, newValue: { componentId: string; memberName: string; }) {
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

    case types.MemberType.ACTION: {
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