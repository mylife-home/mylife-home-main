import React, { FunctionComponent } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import SvgIcon from '@material-ui/core/SvgIcon';
import Typography from '@material-ui/core/Typography';
import Badge from '@material-ui/core/Badge';
import Tooltip from '@material-ui/core/Tooltip';
import ArrowRightIcon from '@material-ui/icons/ArrowRight';
import ArrowLeftIcon from '@material-ui/icons/ArrowLeft';

import VirtualizedTable, { ColumnDefinition } from '../lib/virtualized-table';
import { InstanceIcon, ComponentIcon, StateIcon } from '../lib/icons';
import { HistoryItem, HistoryItemType } from '../../store/online-history/types';

const List: FunctionComponent<{ className?: string; data: HistoryItem[]; }> = ({ className, data }) => {
  const typeRenderer = (value: HistoryItemType) => (<Type value={value} />);
  const previousValueRenderer = (item: HistoryItem) => (<PreviousValue item={item} />);
  const valueDurationRenderer = (item: HistoryItem) => (<ValueDuration item={item} />);

  const columns: ColumnDefinition[] = [
    { dataKey: 'type', width: 50, headerRenderer: 'Type', cellRenderer: typeRenderer },
    { dataKey: 'time', width: 150, headerRenderer: 'Date/Heure', cellDataGetter: ({ rowData }) => formatTimestamp(rowData.timestamp) },
    { dataKey: 'instanceName', headerRenderer: 'Instance' },
    { dataKey: 'componentId', headerRenderer: 'Composant' },
    { dataKey: 'stateName', headerRenderer: 'État' },
    { dataKey: 'stateValue', headerRenderer: 'Nouvelle valeur', cellDataGetter: ({ rowData }) => formatValue(rowData.stateValue) },
    { dataKey: 'previousValue', headerRenderer: 'Ancienne valeur', cellDataGetter: ({ rowData }) => rowData, cellRenderer: previousValueRenderer },
    { dataKey: 'valueDuration', headerRenderer: 'Durée', cellDataGetter: ({ rowData }) => rowData, cellRenderer: valueDurationRenderer },
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
  const { Icon, move, tooltip } = getTypeInfos(value);

  let inner: JSX.Element;

  if (move === 'none') {
    inner = <Icon />;
  } else {

    const BadgeIcon = BADGE_ICON_BY_MOVE[move];
  
    inner = (
      <Badge badgeContent={<BadgeIcon />} classes={{badge: classes[move]}}>
        <Icon />
      </Badge>
    );
  }

  return (
    <Tooltip title={tooltip}>
      {inner}      
    </Tooltip>
  );
};

function getTypeInfos(value: HistoryItemType): { Icon: typeof SvgIcon; move: 'set' | 'clear' | 'none'; tooltip: string; } {
  switch (value) {
    case 'instance-set':
      return { Icon: InstanceIcon, move: 'set', tooltip: 'Instance arrivée' };
    case 'instance-clear':
      return { Icon: InstanceIcon, move: 'clear', tooltip: 'Instance partie' };
    case 'component-set':
      return { Icon: ComponentIcon, move: 'set', tooltip: 'Componsant arrivé' };
    case 'component-clear':
      return { Icon: ComponentIcon, move: 'clear', tooltip: 'Componsant parti' };
    case 'state-set':
      return { Icon: StateIcon, move: 'none', tooltip: 'État changé' };
  }
}

const PreviousValue: FunctionComponent<{ item: HistoryItem }> = ({ item }) => {
  return <>TODO</>;
};

const ValueDuration: FunctionComponent<{ item: HistoryItem }> = ({ item }) => {
  return <>TODO</>;
};

function formatTimestamp(value: Date) {
  return value.toLocaleString('fr-FR');
}

function formatValue(value: any) {
  if (value === undefined || value === null) {
    return '';
  }
  return JSON.stringify(value);
}