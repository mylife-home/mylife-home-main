import React, { FunctionComponent, ReactNode, useMemo, useEffect } from 'react';
import { useStore, Provider } from 'react-redux';

// to be remove when useSelector is fixed
// https://kaihao.dev/posts/Stale-props-and-zombie-children-in-Redux
// https://medium.com/swlh/using-the-react-redux-hooks-api-to-manipulate-store-state-664d7cf27521

const StoreHierarchyFix: FunctionComponent<{ children?: ReactNode }> = ({ children }) => {
  const store = useStore();

  const subStore = useMemo(
    () => ({
      ...store,
      ...createSubscription(),
    }),
    [store]
  );

  useEffect(() => {
    subStore.notifyUpdates();
  }); // Don't pass dependencies so that it will run after every re-render

  return (
    <Provider store={subStore}>
      {children}
    </Provider>
  );
};

export default StoreHierarchyFix;

function createSubscription() {
  const listeners = new Set<() => void>();

  return {
    subscribe(listener: () => void) {
      listeners.add(listener);

      // Returns an unsubscribe function
      return () => {
        listeners.delete(listener);
      };
    },
    notifyUpdates() {
      listeners.forEach(listener => {
        listener();
      });
    },
  };
};
