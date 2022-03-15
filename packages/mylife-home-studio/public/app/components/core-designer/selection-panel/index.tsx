import React, { FunctionComponent, useEffect } from 'react';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';

import { useTabSelector } from '../../lib/use-tab-selector';
import QuickAccess from '../../lib/quick-access';
import { useExtendedSelection } from '../selection';
import Component from './component';
import Binding from './binding';
import Multiple from './multiple';
import { AppState } from '../../../store/types';
import { getComponentIds, getComponent, getBinding, getAllComponentsAndPlugins } from '../../../store/core-designer/selectors';

const useStyles = makeStyles((theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
  },
  display: {
    flex: 1,
    overflow: 'auto',
  },
  componentSelector: {
    margin: theme.spacing(2),
  },
}), { name: 'selection-panel' });

const SelectionPanel: FunctionComponent<{ className?: string; }> = ({ className }) => {
  const classes = useStyles();
  const { selectComponent } = useExtendedSelection();
  const componentsIds = useTabSelector(getComponentIds);

  return (
    <div className={clsx(classes.container, className)}>
      <QuickAccess className={classes.componentSelector} list={componentsIds} onSelect={selectComponent} />
      <DisplayDispatcher className={classes.display} />
    </div>
  );
};

export default SelectionPanel;

const DisplayDispatcher: FunctionComponent<{ className?: string; }> = ({ className }) => {
  const { selectedBinding, selectedComponent, selectedComponents } = useExtendedSelection();

  if (selectedBinding) {
    return (
      <Binding className={className} />
    );
  } else if (selectedComponent) {
    return (
      <Component className={className} />
    );
  } else if (selectedComponents) {
    return (
        <Multiple className={className} />
    );
  } else {
    return null;
  }
}