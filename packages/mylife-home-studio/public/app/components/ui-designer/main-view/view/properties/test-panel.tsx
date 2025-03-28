import React, { FunctionComponent, useState, useMemo, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

import { UiControlTextContextItemData } from '../../../../../../../shared/project-manager';
import { getComponentsMap, getPluginsMap } from '../../../../../store/ui-designer/selectors';
import TestValueEditor from './test-value-editor';
import { useTextValueDetails } from '../control-text-value';

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

const TestPanel: FunctionComponent<{ format: string; context: UiControlTextContextItemData[], updateTestValue: (index: number, testValue: any) => void }> = ({ format, context, updateTestValue }) => {
  const classes = useStyles();
  const contextData = useContextData(context);
  const { compileError, runtimeError, result } = useTextValueDetails(format, context);

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
            <TestValueEditor className={classes.valueEditor} value={item.testValue} onChange={value => updateTestValue(index, value)} valueType={item.valueType} />
          </div>
          <Typography className={classes.valueDetail} variant="caption">{`${item.componentId}.${item.componentState} - ${item.valueType}`}</Typography>
        </React.Fragment>
      ))}
    </div>
  );
};

export default TestPanel;

function useContextData(context: UiControlTextContextItemData[]) {
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
