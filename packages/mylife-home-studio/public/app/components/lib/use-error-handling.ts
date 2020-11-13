import { useCallback } from 'react';
import { useActions } from './use-actions';
import { setError } from '../../store/status/actions';

export function useReportError(): (err: Error) => void {
  const actions = useActions({ setError });
  return actions.setError;
}

export function useFireAsync() {
  const onError = useReportError();
  return useCallback(async (target: () => Promise<any>) => {
    try {
      await target();
    } catch (err) {
      onError(err);
    }
  }, [onError]);
}