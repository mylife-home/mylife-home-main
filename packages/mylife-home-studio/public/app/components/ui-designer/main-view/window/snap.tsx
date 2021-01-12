import React, { FunctionComponent, createContext, useContext, useState, useMemo } from 'react';

interface ContextProps {
  value: number;
  setValue: (value: number) => void;
}

const Context = createContext<ContextProps>(null);

export const SnapContextProvider: FunctionComponent = ({ children}) => {
  const [value, setValue] = useState<number>(1);
  const context = useMemo(() => ({ value, setValue }) as ContextProps, [value, setValue]);

  return (
    <Context.Provider value={context}>
      {children}
    </Context.Provider>
  );
}

export function useSnapValue() {
  const { value } = useContext(Context);
  return value;
}

export function useSnapEditor() {
  return useContext(Context);
}
