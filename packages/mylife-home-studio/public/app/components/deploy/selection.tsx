import React, { FunctionComponent, createContext, useContext, useMemo, useState } from 'react';

type SelectionType = 'recipes' | 'recipe' | 'runs' | 'run' | 'files';

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
  const [selection, select] = useState<Selection>(null);
  const contextProps = useMemo(() => ({ selection, select }), [selection, select]);

  return (
    <SelectionContext.Provider value={contextProps}>
      {children}
    </SelectionContext.Provider>
  );
};
