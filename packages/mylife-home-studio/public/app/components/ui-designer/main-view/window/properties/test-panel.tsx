import React, { FunctionComponent, useState, useMemo, useEffect, useCallback } from 'react';

import { ControlTextContextItem } from '../../../../../../../shared/ui-model';
import { makeGetComponentsAndPlugins } from '../../../../../store/ui-designer/selectors';
import { useTabSelector } from '../../../../lib/use-tab-selector';

interface TestResult {
  result: string;
  compileError: Error;
  runtimeError: Error;
}

type Values = { [id: string]: any; };

const TestPanel: FunctionComponent<{ format: string; context: ControlTextContextItem[] }> = ({ format, context }) => {
  const contextData = useContextData(context);
  const { values, updateValue } = useValues(context);
  const testResult = useTest(format, context, values);

  return (
    <>
      TODO: pouvoir tester la sortie en fournissant des valeurs de context
      {JSON.stringify(contextData)}
    </>
  );
};

export default TestPanel;

function useContextData(context: ControlTextContextItem[]) {
  const getComponentsAndPlugins = useMemo(() => makeGetComponentsAndPlugins(), []);
  const componentsAndPlugins = useTabSelector(getComponentsAndPlugins);

  return useMemo(() => {
    const map = new Map(componentsAndPlugins.map(componentAndPlugin => ([componentAndPlugin.component.id, componentAndPlugin.plugin])));

    return context.map(item => {
      const plugin = map.get(item.componentId);
      const state = plugin.members[item.componentState];
      return { ...item, valueType: state.valueType };
    });
  }, [context, componentsAndPlugins]);
}

function useValues(context: ControlTextContextItem[]) {
  const [values, setValues] = useState<Values>({});

  useEffect(() => {
    const newValues: Values = {};
    for (const { id } of context) {
      newValues[id] = null;
    }

    setValues(newValues);
  }, [context]);

  const updateValue = useCallback((id: string, newValue: any) => setValues(values => ({ ...values, [id]: newValue })), [setValues]);

  return { values, updateValue };
}

function useTest(format: string, context: ControlTextContextItem[], values: Values): TestResult {
  interface CompileResult {
    executor: (args: any[]) => string;
    compileError: Error;
  }

  const { executor, compileError } = useMemo(() => {
    const argNames = context.map(item => item.id).join(',');
  
    try {
      const executor = new Function(argNames, format) as (args: any[]) => string;
      return { executor, compileError: null } as CompileResult;
    } catch (compileError) {
      return { executor: null, compileError } as CompileResult;
    }
  }, [format, context]);

  return useMemo(() => {
    if (compileError) {
      return { result: null, compileError, runtimeError: null } as TestResult;
    }

    const args = context.map(item => values[item.id]);
    try {
      const result = executor(args);
      return { result, compileError: null, runtimeError: null } as TestResult;
    } catch (runtimeError) {
      return { result: null, compileError: null, runtimeError } as TestResult;
    }

  }, [values, executor, compileError]);
}
