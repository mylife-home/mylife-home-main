import React, { FunctionComponent } from 'react';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';

import { useTabSelector } from '../../lib/use-tab-selector';
import QuickAccess from '../../lib/quick-access';
import { useSelectionType, useSelectComponent } from '../selection';
import Component from './component';
import Binding from './binding';
import Multiple from './multiple';
import { getComponentIds } from '../../../store/core-designer/selectors';

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
  const selectComponent = useSelectComponent();
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
  const type = useSelectionType();

  switch (type) {
    case 'binding':
      return (
        <Binding className={className} />
      );

    case 'component':
      return (
        <Component className={className} />
      );

    case 'components':
      return (
        <Multiple className={className} />
      );

    default:
      return null;
  }
}