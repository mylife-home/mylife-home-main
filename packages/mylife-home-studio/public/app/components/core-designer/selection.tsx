import React, { FunctionComponent, createContext, useState, useMemo, useContext, useCallback, useEffect } from 'react';

type SelectionType = 'component' | 'binding' | 'multiple';

export interface Selection {
  type: SelectionType;
}

export interface SimpleSelection extends Selection {
  type: 'component' | 'binding';
  id: string;
}

type MultiSelectionIds = { [id: string]: true };

export interface MultipleSelection extends Selection {
  type: 'multiple';
  ids: MultiSelectionIds;
}

interface SelectionContextProps {
  selection: Selection;
  selectedComponent: string;
  selectedBinding: string;
  selectedComponents: MultiSelectionIds;
  select: (selection: SimpleSelection | MultipleSelection) => void;
}

export const SelectionContext = createContext<SelectionContextProps>(null);

export function useSelection() {
  return useContext(SelectionContext);
}

export function useComponentSelection(componentId: string) {
  const { selection, select: setSelection } = useSelection();

  return { 
    selected: isComponentSelected(componentId, selection),
    select: useCallback(() => setSelection({ type: 'component', id: componentId }), [setSelection, componentId]),
    multiSelectToggle: useCallback(() => {
      const selectedComponents = getSelectedComponents(selection);
      const ids = { ... selectedComponents };
      toggle(ids, componentId);
      const array = Object.keys(ids);

      if (array.length === 0) {
        // unselected last component, no selection anymore
        setSelection(null);
      } else if (array.length === 1) {
        // switch back to single if only one selected
        setSelection({ type: 'component', id: array[0] });
      } else {
        setSelection({ type: 'multiple', ids });
      }
    }, [setSelection, componentId, selection])
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
