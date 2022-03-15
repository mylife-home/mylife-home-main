import React, { FunctionComponent, createContext, useState, useMemo, useContext, useCallback, useEffect } from 'react';

export type SelectionType = 'components' | 'binding';

export interface Selection {
  type: SelectionType;
}

export interface BindingSelection extends Selection {
  type: 'binding';
  id: string;
}

export type MultiSelectionIds = { [id: string]: true };

export interface ComponentsSelection extends Selection {
  type: 'components';
  ids: MultiSelectionIds;
}

interface SelectionContextProps {
  selection: Selection;
  select: (callback: (prev: Selection) => Selection) => void;
}

export const SelectionContext = createContext<SelectionContextProps>(null);

export function useSelection() {
  return useContext(SelectionContext);
}

export function useExtendedSelection() {
  const { selection, select } = useSelection();

  const selectionDetails = useMemo(() => {
    const comps = getSelectedComponentsIds(selection);
    const compsArray = Object.keys(comps);

    return {
      selectedComponent: compsArray.length === 1 ? compsArray[0] : null,
      selectedComponents: compsArray.length > 1 ? comps : null,
      selectedBinding: selection?.type === 'binding' ? (selection as BindingSelection).id : null,
    };

  }, [selection]);

  const selectComponent = useCallback((componentId: string) => {
    const newSelection: ComponentsSelection = { type: 'components', ids: { [componentId]: true } };
    select(() => newSelection);
  }, [select]);

  const selectBinding = useCallback((bindingId: string) => {
    const newSelection: BindingSelection = { type: 'binding', id: bindingId };
    select(() => newSelection);
  }, [select]);

  const selectComponents = useCallback((componentsIds: string[]) => {
    const ids: MultiSelectionIds = {};
    for (const id of componentsIds) {
      ids[id] = true;
    }

    const newSelection: ComponentsSelection = { type: 'components', ids };
    select(() => newSelection);
  }, [select]);

  return { ...selectionDetails, selectComponent, selectBinding, selectComponents };
}

export function useComponentSelection(componentId: string) {
  const { selection, select } = useSelection();

  return { 
    selected: !!getSelectedComponentsIds(selection)[componentId],

    select: useCallback(() => {
      select((selection) => {
        // If already selected do nothing
        const selectedComponents = getSelectedComponentsIds(selection);
        if (selectedComponents[componentId]) {
          return selection;
        }

        const newSelection: ComponentsSelection = { type: 'components', ids: { [componentId]: true } };
        return newSelection;
      });
    }, [select, componentId]),

    multiSelectToggle: useCallback(() => {
      select((selection) => {
        const selectedComponents = getSelectedComponentsIds(selection);

        const ids = { ... selectedComponents };
        toggle(ids, componentId);

        const newSelection: ComponentsSelection = { type: 'components', ids };
        return newSelection;
      });
    }, [select, componentId])
  };
}

export function getSelectedComponentsIds(selection: Selection): MultiSelectionIds {
  return selection?.type === 'components' ? (selection as ComponentsSelection).ids : {};
}

function toggle(ids: MultiSelectionIds, id: string) {
  if(ids[id]) {
    delete ids[id];
  } else {
    ids[id] = true;
  }
}

export function useBindingSelection(bindingId: string) {
  const { selection, select } = useSelection();

  return { 
    selected: selection?.type === 'binding' && (selection as BindingSelection).id === bindingId,
    select: useCallback(() => {
      const newSelection: BindingSelection = { type: 'binding', id: bindingId };
      select(() => newSelection);
    }, [select, bindingId])
  };
}

export const SelectionProvider: FunctionComponent = ({ children }) => {
  const [selection, select] = useState<Selection>(null);
  const contextProps = useMemo(() => ({ selection, select }), [selection, select]);

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
