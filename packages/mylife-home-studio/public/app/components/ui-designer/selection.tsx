import React, { FunctionComponent, createContext, useContext, useMemo, useState, useEffect } from 'react';

type SelectionType = 'project' | 'windows' | 'window' | 'resources' | 'components';

export interface Selection {
  type: SelectionType;
  id?: string;
}

interface SelectionContextProps {
  selection: Selection;
  select: (selection: Selection) => void;
}

const SelectionContext = createContext<SelectionContextProps>(null);

export function useSelection() {
  return useContext(SelectionContext);
}

export const SelectionProvider: FunctionComponent = ({ children }) => {
  const [selection, select] = useState<Selection>({ type: 'project' });
  const contextProps = useMemo(() => ({ selection, select }), [selection, select]);

  return <SelectionContext.Provider value={contextProps}>{children}</SelectionContext.Provider>;
};

export function useResetSelectionIfNull<T>(obj: T) {
  const { select } = useSelection();

  useEffect(() => {
    if (!obj) {
      select({ type: 'project' });
    }
  }, [obj]);
}