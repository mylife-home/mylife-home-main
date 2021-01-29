import React, { useCallback } from 'react';

import { useFireAsync } from '../../../lib/use-error-handling';
import { useProjectSelectionDialog } from './project-selection-dialog';

export function useRefreshComponentsFromOnline() {
  return () => console.log('TODO useRefreshComponentsFromOnline');
}

export function useRefreshComponentsFromCoreProject() {
  const fireAsync = useFireAsync();
  const showProjectSelectionDialog = useProjectSelectionDialog();

  return useCallback(() => {
    fireAsync(async () => {
      const projectId = await showProjectSelectionDialog();
      if (projectId) {
        console.log('TODO useRefreshComponentsFromCoreProject', projectId);
      }
    });
  }, [fireAsync, showProjectSelectionDialog]);
}
