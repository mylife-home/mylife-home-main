import { useCallback } from 'react';
import { useAction } from './use-actions';
import { setError } from '../../store/status/actions';

export function useReportError(): (err: Error) => void {
  return useAction(setError);
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