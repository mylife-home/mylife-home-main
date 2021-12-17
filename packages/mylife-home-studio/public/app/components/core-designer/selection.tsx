import React, { FunctionComponent, createContext, useState, useMemo, useContext, useCallback, useEffect } from 'react';

export type SelectionType = 'component' | 'binding' | 'multiple';

export interface Selection {
  type: SelectionType;
}

export interface SimpleSelection extends Selection {
  type: 'component' | 'binding';
  id: string;
}

export type MultiSelectionIds = { [id: string]: true };

export interface MultipleSelection extends Selection {
  type: 'multiple';
  ids: MultiSelectionIds;
}

interface SelectionContextProps {
  selection: Selection;
  selectedComponent: string;
  selectedBinding: string;
  selectedComponents: MultiSelectionIds;
  select: (selection: SimpleSelection) => void;
  selectMulti: (ids: MultiSelectionIds) => void;
}

export const SelectionContext = createContext<SelectionContextProps>(null);

export function useSelection() {
  return useContext(SelectionContext);
}

export function useComponentSelection(componentId: string) {
  const { selection, select, selectMulti } = useSelection();

  return { 
    selected: isComponentSelected(componentId, selection),
    select: useCallback(() => select({ type: 'component', id: componentId }), [select, componentId]),
    multiSelectToggle: useCallback(() => {
      const selectedComponents = getSelectedComponents(selection);
      const ids = { ... selectedComponents };
      toggle(ids, componentId);
      selectMulti(ids);
    }, [selectMulti, componentId, selection])
  };
}

function isComponentSelected(componentId: string, selection: Selection) {
  switch (selection?.type) {
    case 'component':
      return componentId === (selection as SimpleSelection).id;
    case 'multiple':
      return !!(selection as MultipleSelection).ids[componentId];
  }

  return false;
}

function getSelectedComponents(selection: Selection): MultiSelectionIds {
  switch (selection?.type) {
    case 'component':
      return { [(selection as SimpleSelection).id]: true };
    case 'multiple':
      return (selection as MultipleSelection).ids;
  }

  return {};
}

function toggle(ids: MultiSelectionIds, id: string) {
  if(ids[id]) {
    delete ids[id];
  } else {
    ids[id] = true;
  }
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
    select,
    selectMulti: (ids: MultiSelectionIds) => {
      const array = Object.keys(ids);

      if (array.length === 0) {
        // unselected last component, no selection anymore
        select(null);
      } else if (array.length === 1) {
        // switch back to single if only one selected
        const sel: SimpleSelection = { type: 'component', id: array[0] };
        select(sel);
      } else {
        const sel: MultipleSelection = { type: 'multiple', ids };
        select(sel);
      }

    }
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
