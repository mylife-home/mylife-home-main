import React, { FunctionComponent, useState, useMemo, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

import { ControlTextContextItem } from '../../../../../../../shared/ui-model';
import { getComponentsMap, getPluginsMap } from '../../../../../store/ui-designer/selectors';
import TestValueEditor from './test-value-editor';

interface TestResult {
  result: string;
  compileError: Error;
  runtimeError: Error;
}

type Values = { [id: string]: any; };

const useStyles = makeStyles((theme) => ({
  container: {
    padding: theme.spacing(2),
  },
  value: {
    marginTop: theme.spacing(4),
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  valueId: {
    width: 80,
  },
  valueEditor: {
    flex: 1
  },
  valueDetail: {
    marginLeft: theme.spacing(4),
  },
}), { name: 'window-test-panel'});

const TestPanel: FunctionComponent<{ format: string; context: ControlTextContextItem[] }> = ({ format, context }) => {
  const classes = useStyles();
  const contextData = useContextData(context);
  const { values, updateValue } = useValues(context);
  const { compileError, runtimeError, result } = useTest(format, context, values);

  return (
    <div className={classes.container}>
      {compileError && (
        <Typography variant="h6" color="error">Erreur de compilation : {compileError.message}</Typography>
      )}
      {runtimeError && (
        <Typography variant="h6" color="error">Erreur d'exécution : {runtimeError.message}</Typography>
      )}
      {!compileError && !runtimeError && (
        <Typography variant="h6">Sortie : "{result}"</Typography>
      )}

      {contextData.map((item, index) => (
        <React.Fragment key={index} >
          <div className={classes.value}>
            <Typography className={classes.valueId}>{item.id}</Typography>
            <TestValueEditor className={classes.valueEditor} value={values[item.id]} onChange={value => updateValue(item.id, value)} valueType={item.valueType} />
          </div>
          <Typography className={classes.valueDetail} variant="caption">{`${item.componentId}.${item.componentState} - ${item.valueType}`}</Typography>
        </React.Fragment>
      ))}
    </div>
  );
};

export default TestPanel;

function useContextData(context: ControlTextContextItem[]) {
  // TODO: move that into selector on control "getControlTextContextData(state, controlId)"
  const componentsMap = useSelector(getComponentsMap);
  const pluginsMap = useSelector(getPluginsMap);

  return useMemo(() => context.map(item => {
    const component = componentsMap[item.componentId]
    const plugin = pluginsMap[component.plugin];
    const state = plugin.members[item.componentState];
    return { ...item, valueType: state.valueType };
  }), [context, componentsMap, pluginsMap]);
}

function useValues(context: ControlTextContextItem[]) {
  const [values, setValues] = useState<Values>(valuesFromContext(context));

  useEffect(() => {
    setValues(valuesFromContext(context));
  }, [context]);

  const updateValue = useCallback((id: string, newValue: any) => setValues(values => ({ ...values, [id]: newValue })), [setValues]);

  return { values, updateValue };
}

function valuesFromContext(context: ControlTextContextItem[]) {
  const values: Values = {};
  for (const { id } of context) {
    values[id] = null;
  }
  return values;
}

function useTest(format: string, context: ControlTextContextItem[], values: Values): TestResult {
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

    const args = context.map(item => values[item.id]);
    try {
      const result = executor(...args);

      if (typeof result !== 'string') {
        throw new Error(`Result type is not a string: '${result}'`);
      }

      return { result, compileError: null, runtimeError: null } as TestResult;
    } catch (runtimeError) {
      return { result: null, compileError: null, runtimeError } as TestResult;
    }

  }, [values, executor, compileError]);
}
