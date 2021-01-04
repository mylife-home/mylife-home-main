import React, { createContext, FunctionComponent, useContext, useMemo, useState } from 'react';

export type Select = (control: string) => void;

interface SelectionContextProps {
  selection: string; // control id or null for window itself
  select: Select;
}

const SelectionContext = createContext<SelectionContextProps>(null);

export function useSelection() {
  return useContext(SelectionContext);
}

export const SelectionProvider: FunctionComponent = ({ children }) => {
  const [selection, select] = useState<string>(null);
  const context: SelectionContextProps = useMemo(() => ({ selection, select }), [selection, select]);

  return (
    <SelectionContext.Provider value={context}>
      {children}
    </SelectionContext.Provider>
  );
};
