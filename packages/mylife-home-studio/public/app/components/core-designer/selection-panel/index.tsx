import React, { FunctionComponent } from 'react';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';

import { useTabSelector } from '../../lib/use-tab-selector';
import QuickAccess from '../../lib/quick-access';
import { useResetSelectionIfNull, useSelection } from '../selection';
import Component from './component';
import Binding from './binding';
import Multiple from './multiple';
import { AppState } from '../../../store/types';
import { getComponentIds, getComponent, getBinding } from '../../../store/core-designer/selectors';

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
  const { select } = useSelection();
  const componentsIds = useTabSelector(getComponentIds);

  return (
    <div className={clsx(classes.container, className)}>
      <QuickAccess className={classes.componentSelector} list={componentsIds} onSelect={id => select({ type: 'component', id })} />
      <DisplayDispatcher className={classes.display} />
    </div>
  );
};

export default SelectionPanel;

const DisplayDispatcher: FunctionComponent<{ className?: string; }> = ({ className }) => {
  const { selection } = useSelection();

  switch(selection?.type) {

    case 'component':
      return (
        <NullWrapper selector={getComponent}>
          <Component className={className} />
        </NullWrapper>
      );

    case 'binding':
      return (
        <NullWrapper selector={getBinding}>
          <Binding className={className} />
        </NullWrapper>
      );

    case 'multiple':
      return (
        <Multiple className={className} />
      );

    default:
      return null;
  }
}

const NullWrapper: FunctionComponent<{ selector: (state: AppState, tabId: string, id: string) => any; }> = ({ selector, children }) => {
  const { selectedComponent, selectedBinding } = useSelection();
  const item = useTabSelector((state, tabId) => selector(state, tabId, selectedComponent || selectedBinding));
  useResetSelectionIfNull(item);

  if(!item) {
    return null;
  }

  return (
    <>
      {children}
    </>
  );
};
