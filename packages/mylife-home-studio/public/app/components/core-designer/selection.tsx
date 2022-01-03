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
  select: (callback: (prev: Selection) => Selection) => void;

  selectedComponent: string;
  selectedBinding: string;
  selectedComponents: MultiSelectionIds;
  selectComponent: (id: string) => void;
  selectComponents: (ids: string[]) => void;
  selectBinding: (id: string) => void;
}

export const SelectionContext = createContext<SelectionContextProps>(null);

export function useSelection() {
  return useContext(SelectionContext);
}

export function useComponentSelection(componentId: string) {
  const { selection, select } = useSelection();

  return { 
    selected: isComponentSelected(componentId, selection),

    select: useCallback(() => {
      select((selection) => {
        // If already selected do nothing
        const selectedComponents = getSelectedComponentsIds(selection);
        if (selectedComponents[componentId]) {
          return selection;
        }

        const newSelection: SimpleSelection = { type: 'component', id: componentId };
        return newSelection;
      });
    }, [select, componentId]),

    multiSelectToggle: useCallback(() => {
      select((selection) => {
        const selectedComponents = getSelectedComponentsIds(selection);

        const ids = { ... selectedComponents };
        toggle(ids, componentId);

        const newSelection: MultipleSelection = { type: 'multiple', ids };
        return newSelection;
      });
    }, [select, componentId])
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

export function getSelectedComponentsIds(selection: Selection): MultiSelectionIds {
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
  const { selectedBinding, selectBinding } = useSelection();

  return { 
    selected: selectedBinding === bindingId,
    select: useCallback(() => selectBinding(bindingId), [selectBinding, bindingId])
  };
}

export const SelectionProvider: FunctionComponent = ({ children }) => {
  const [selection, select] = useState<Selection>(null);

  const selectComponent = useCallback((id: string) => {
    const newSelection: SimpleSelection = { type: 'component', id };
    select(newSelection);
  }, [select]);

  const selectComponents = useCallback((ids: string[]) => {
    const newIds: MultiSelectionIds = {};
    const newSelection: MultipleSelection = { type: 'multiple', ids: newIds };

    for (const id of ids) {
      newIds[id] = true;
    }

    select(newSelection);
  }, [select]);

  const selectBinding = useCallback((id: string) => {
    const newSelection: SimpleSelection = { type: 'binding', id };
    select(newSelection);
  }, [select]);

  const contextProps = useMemo(() => ({ 
    selection,
    select,

    selectedComponent: selection?.type === 'component' ? (selection as SimpleSelection).id : null,
    selectedBinding: selection?.type === 'binding' ? (selection as SimpleSelection).id : null,
    selectedComponents: selection?.type === 'multiple' ? (selection as MultipleSelection).ids : null,

    selectComponent,
    selectComponents,
    selectBinding
  }), [selection, select, selectComponent, selectComponents, selectBinding]);

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
