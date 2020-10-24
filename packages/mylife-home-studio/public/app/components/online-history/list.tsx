import React, { FunctionComponent } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import SvgIcon from '@material-ui/core/SvgIcon';
import Badge from '@material-ui/core/Badge';
import ArrowRightIcon from '@material-ui/icons/ArrowRight';
import ArrowLeftIcon from '@material-ui/icons/ArrowLeft';

import VirtualizedTable, { ColumnDefinition } from '../lib/virtualized-table';
import { InstanceIcon, ComponentIcon, StateIcon } from '../lib/icons';
import { HistoryItem, HistoryItemType } from '../../store/online-history/types';

const List: FunctionComponent<{ className?: string; data: HistoryItem[]; }> = ({ className, data }) => {
  const typeRenderer = (value: HistoryItemType) => (
    <Type value={value} />
  );

  const columns: ColumnDefinition[] = [
    { dataKey: 'type', width: 50, headerRenderer: 'Type', cellRenderer: typeRenderer },
    { dataKey: 'time', width: 150, headerRenderer: 'Date/Heure', cellDataGetter: ({ rowData }) => formatTimestamp(rowData.timestamp) },
  ];

  return (
    <VirtualizedTable data={data} columns={columns} className={className} />
  );
};

export default List;

const useTypeStyles = makeStyles((theme) => ({
  set: {
    background: null,
    color: theme.palette.success.main
  },
  clear: {
    background: null,
    color: theme.palette.error.main
  },
}));

const BADGE_ICON_BY_MOVE = {
  set: ArrowRightIcon,
  clear: ArrowLeftIcon,
};

const Type: FunctionComponent<{ value: HistoryItemType }> = ({ value }) => {
  const classes = useTypeStyles();
  const { Icon, move } = getTypeInfos(value);

  if (move === 'none') {
    return <Icon />;
  }

  const BadgeIcon = BADGE_ICON_BY_MOVE[move];
  
  return (
    <Badge badgeContent={<BadgeIcon />} classes={{badge: classes[move]}}>
      <Icon />
    </Badge>
  );
};

function getTypeInfos(value: HistoryItemType): { Icon: typeof SvgIcon; move: 'set' | 'clear' | 'none'; } {
  switch (value) {
    case 'instance-set':
      return { Icon: InstanceIcon, move: 'set' };
    case 'instance-clear':
      return { Icon: InstanceIcon, move: 'clear' };
    case 'component-set':
      return { Icon: ComponentIcon, move: 'set' };
    case 'component-clear':
      return { Icon: ComponentIcon, move: 'clear' };
    case 'state-set':
      return { Icon: StateIcon, move: 'none' };
  }
}

function formatTimestamp(value: Date) {
  return value.toLocaleString('fr-FR');
}
