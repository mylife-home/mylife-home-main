import React, { FunctionComponent, createContext, useState, useMemo, useContext, useCallback } from 'react';

type SelectionType = 'component' | 'binding';

export interface Selection {
  type: SelectionType;
  id: string;
}

interface SelectionContextProps {
  selection: Selection;
  select: (selection: Selection) => void;
}

export const SelectionContext = createContext<SelectionContextProps>(null);

export function useSelection() {
  return useContext(SelectionContext);
}

function useElementSelection(id: string, type: SelectionType) {
  const { selection, select: setSelection } = useSelection();
  const selected = useMemo(() => selection?.type === type && selection.id === id, [selection, id]);
  const select = useCallback(() => setSelection({ type, id }), [setSelection, id]);
  return { selected, select };
}

export function useComponentSelection(componentId: string) {
  return useElementSelection(componentId, 'component');
}

export function useBindingSelection(bindingId: string) {
  return useElementSelection(bindingId, 'binding');
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
