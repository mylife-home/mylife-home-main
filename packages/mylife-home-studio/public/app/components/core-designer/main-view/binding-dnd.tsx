import React, { FunctionComponent, createContext, useState, useMemo, useContext, useCallback } from 'react';
import * as types from '../../../store/core-designer/types';

export interface BindingSource {
  componentId: string;
  memberName: string;
};

export interface BindingDnd {
  source: BindingSource;
  mousePosition: types.Position;
}

export type DragEventType = 'start' | 'move' | 'end';

interface BindingDndProps {
  value: BindingDnd;
  // Source only used when event = start
  onDrag: (type: DragEventType, mousePosition: types.Position, source?: BindingSource) => void;
}

export const BindingDndContext = createContext<BindingDndProps>(null);

function useBindingDnd() {
  return useContext(BindingDndContext);
}

export function useBindingDraggable() {
  const { onDrag } = useBindingDnd();
  return onDrag;
}

export function useBindingDndInfo() {
  const { value } = useBindingDnd();
  return value;
}

export const BindingDndProvider: FunctionComponent<{ onDrop: (source: BindingSource, mousePosition: types.Position) => void }> = ({ children, onDrop }) => {
  const [value, setValue] = useState<BindingDnd>(null);

  const onDrag = useCallback((type: DragEventType, mousePosition: types.Position, source?: BindingSource) => setValue(actualValue => {
    switch(type) {
      case 'start':
        if(!source) {
          throw new Error('source mandatory on start');
        }

        return { mousePosition, source };
      case 'move':
        return { ...actualValue, mousePosition };

      case 'end':
        onDrop(actualValue.source, mousePosition);
        return null;

      default:
        throw new Error(`Unknown event type: '${type}'`);
    }
  }), [setValue, onDrop]);

  const contextProps = useMemo(() => ({ value, onDrag }), [value, onDrag]);

  return (
    <BindingDndContext.Provider value={contextProps}>
      {children}
    </BindingDndContext.Provider>
  );
}
