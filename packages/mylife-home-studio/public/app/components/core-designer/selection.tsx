import React, { FunctionComponent, createContext, useState, useMemo, useContext, useCallback, useEffect } from 'react';

export type SelectionType = 'component' | 'binding' | 'components';

export interface Selection {
  type: SelectionType;
}

export interface SingleSelection extends Selection {
  type: 'component' | 'binding';
  id: string;
}

export type MultiSelectionIds = { [id: string]: true };

export interface MultiSelection extends Selection {
  type: 'components';
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

        const newSelection: SingleSelection = { type: 'component', id: componentId };
        return newSelection;
      });
    }, [select, componentId]),

    multiSelectToggle: useCallback(() => {
      select((selection) => {
        const selectedComponents = getSelectedComponentsIds(selection);

        const ids = { ... selectedComponents };
        toggle(ids, componentId);

        const newSelection: MultiSelection = { type: 'components', ids };
        return newSelection;
      });
    }, [select, componentId])
  };
}

function isComponentSelected(componentId: string, selection: Selection) {
  switch (selection?.type) {
    case 'component':
      return componentId === (selection as SingleSelection).id;
    case 'components':
      return !!(selection as MultiSelection).ids[componentId];
  }

  return false;
}

export function getSelectedComponentsIds(selection: Selection): MultiSelectionIds {
  switch (selection?.type) {
    case 'component':
      return { [(selection as SingleSelection).id]: true };
    case 'components':
      return (selection as MultiSelection).ids;
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
    const newSelection: SingleSelection = { type: 'component', id };
    select(newSelection);
  }, [select]);

  const selectComponents = useCallback((ids: string[]) => {
    const newIds: MultiSelectionIds = {};
    const newSelection: MultiSelection = { type: 'components', ids: newIds };

    for (const id of ids) {
      newIds[id] = true;
    }

    select(newSelection);
  }, [select]);

  const selectBinding = useCallback((id: string) => {
    const newSelection: SingleSelection = { type: 'binding', id };
    select(newSelection);
  }, [select]);

  const contextProps = useMemo(() => ({ 
    selection,
    select,

    selectedComponent: selection?.type === 'component' ? (selection as SingleSelection).id : null,
    selectedBinding: selection?.type === 'binding' ? (selection as SingleSelection).id : null,
    selectedComponents: selection?.type === 'components' ? (selection as MultiSelection).ids : null,

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
