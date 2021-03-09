import React, { FunctionComponent } from 'react';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';

import { getComponentIds } from '../../../store/core-designer/selectors';
import { useTabSelector } from '../../lib/use-tab-selector';
import QuickAccess from '../../lib/quick-access';
import { useSelection } from '../selection';
import Component from './component';
import Binding from './binding';

const useStyles = makeStyles((theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
  },
  display: {
    flex: 1,
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
      <DisplayDispatcher />
    </div>
  );
};

export default SelectionPanel;

const DisplayDispatcher: FunctionComponent<{ className?: string; }> = ({ className }) => {
  const { selection } = useSelection();

  switch(selection?.type) {

    case 'component':
      return (
        <Component className={className} />
      );

    case 'binding':
      return (
        <Binding className={className} />
      );

    default:
      return null;
  }
}
