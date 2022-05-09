import { useMemo } from 'react';
import { UiControlTextContextItemData, UiControlTextData } from '../../../../../../shared/project-manager';

export interface TestResult {
  result: string;
  compileError: Error;
  runtimeError: Error;
}

export function useTextValueDetails(format: string, context: UiControlTextContextItemData[]): TestResult {
  interface CompileResult {
    executor: (...args: any[]) => string;
    compileError: Error;
  }

  const { executor, compileError } = useMemo(() => {
    const argNames = context.map(item => item.id).join(',');
  
    try {
      const executor = new Function(argNames, format) as (...args: any[]) => string;
      return { executor, compileError: null } as CompileResult;
    } catch (compileError) {
      return { executor: null, compileError } as CompileResult;
    }
  }, [format, context]);

  return useMemo(() => {
    if (compileError) {
      return { result: null, compileError, runtimeError: null } as TestResult;
    }

    const args = context.map(item => item.testValue);
    try {
      const result = executor(...args);

      if (typeof result !== 'string') {
        throw new Error(`Result type is not a string: '${result}'`);
      }

      return { result, compileError: null, runtimeError: null } as TestResult;
    } catch (runtimeError) {
      return { result: null, compileError: null, runtimeError } as TestResult;
    }

  }, [context, executor, compileError]);
}

export function useTextValue(text: UiControlTextData) {
  const { result, compileError, runtimeError } = useTextValueDetails(text.format, text.context);
  return compileError?.message || runtimeError?.message || result;
}