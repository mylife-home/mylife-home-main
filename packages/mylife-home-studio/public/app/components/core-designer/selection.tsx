import React, { FunctionComponent, createContext, useState, useMemo, useContext, useCallback, useEffect } from 'react';

type SelectionType = 'component' | 'binding' | 'multiple';

export interface Selection {
  type: SelectionType;
}

export interface SimpleSelection extends Selection {
  type: 'component' | 'binding';
  id: string;
}

export interface MultipleSelection extends Selection {
  type: 'multiple';
  ids: string[];
}

interface SelectionContextProps {
  selection: Selection;
  selectedComponent: string;
  selectedBinding: string;
  selectedComponents: string[];
  select: (selection: SimpleSelection | MultipleSelection) => void;
}

export const SelectionContext = createContext<SelectionContextProps>(null);

export function useSelection() {
  return useContext(SelectionContext);
}

export function useComponentSelection(componentId: string) {
  const { selectedComponent, select: setSelection } = useSelection();

  return { 
    selected: selectedComponent === componentId,
    select: useCallback(() => setSelection({ type: 'component', id: componentId }), [setSelection, componentId])
  };
}

export function useBindingSelection(bindingId: string) {
  const { selectedBinding, select: setSelection } = useSelection();

  return { 
    selected: selectedBinding === bindingId,
    select: useCallback(() => setSelection({ type: 'binding', id: bindingId }), [setSelection, bindingId])
  };
}

export const SelectionProvider: FunctionComponent = ({ children }) => {
  const [selection, select] = useState<Selection>(null);
  const contextProps = useMemo(() => ({ 
    selection,
    selectedComponent: selection?.type === 'component' ? (selection as SimpleSelection).id : null,
    selectedBinding: selection?.type === 'binding' ? (selection as SimpleSelection).id : null,
    selectedComponents: selection?.type === 'multiple' ? (selection as MultipleSelection).ids : null,
    select
  }), [selection, select]);

  return (
    <SelectionContext.Provider value={contextProps}>
      {children}
    </SelectionContext.Provider>
  );
}

export function useResetSelectionIfNull<T>(obj: T) {
  const { select } = useSelection();

  useEffect(() => {
    if (!obj) {
      select(null);
    }
  }, [obj]);
}
