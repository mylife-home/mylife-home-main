import React, { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';
import { TableCellDataGetterParams } from 'react-virtualized';
import { makeStyles } from '@material-ui/core/styles';
import SvgIcon from '@material-ui/core/SvgIcon';
import Badge from '@material-ui/core/Badge';
import Tooltip from '@material-ui/core/Tooltip';
import ArrowRightIcon from '@material-ui/icons/ArrowRight';
import ArrowLeftIcon from '@material-ui/icons/ArrowLeft';

import VirtualizedTable, { ColumnDefinition } from '../../lib/virtualized-table';
import { AppState } from '../../../store/types';
import { ComponentHistoryItem, InstanceHistoryItem, StateHistoryItem } from '../../../store/online-history/types';
import { getItem } from '../../../store/online-history/selectors';

import Type from './type';

const Timestamp: FunctionComponent<{ id: string; }> = ({ id }) => {
  const item = useItem(id);
  const value = item.timestamp.toLocaleString('fr-FR');
  return (<>{value}</>);
};

const InstanceName: FunctionComponent<{ id: string; }> = ({ id }) => {
  const item = useItem(id);

  switch (item.type) {
    case 'instance-set':
    case 'instance-clear':
      return (<>{(item as InstanceHistoryItem).instanceName}</>);
    case 'component-set':
    case 'component-clear':
      return (<>{(item as ComponentHistoryItem).instanceName}</>);
    case 'state-set':
      return (<>{(item as StateHistoryItem).instanceName}</>);
  }
};

const ComponentId: FunctionComponent<{ id: string; }> = ({ id }) => {
  const item = useItem(id);

  switch (item.type) {
    case 'instance-set':
    case 'instance-clear':
      return null;
    case 'component-set':
    case 'component-clear':
      return (<>{(item as ComponentHistoryItem).componentId}</>);
    case 'state-set':
      return (<>{(item as StateHistoryItem).componentId}</>);
  }
};

const StateName: FunctionComponent<{ id: string; }> = ({ id }) => {
  const item = useItem(id);

  if (item.type !== 'state-set') {
    return null;
  }

  const typedItem = item as StateHistoryItem;
  return (<>{typedItem.stateName}</>);
};

const StateValue: FunctionComponent<{ id: string; }> = ({ id }) => {
  const item = useItem(id);

  if (item.type !== 'state-set') {
    return null;
  }

  const typedItem = item as StateHistoryItem;
  const value = JSON.stringify(typedItem.stateValue);
  return (<>{value}</>);
};

/*
const PreviousValue: FunctionComponent<{ item: HistoryItem }> = ({ item }) => {
  const value = usePreviousValue(item);
  return (
    <>
      {value}
    </>
  );
};

function usePreviousValue(item: HistoryItem) {
  return 'TODO';
}

const ValueDuration: FunctionComponent<{ item: HistoryItem }> = ({ item }) => {
  const duration = useValueDuration(item);
  return (
    <>
      {duration}
    </>
  );
};

function useValueDuration(item: HistoryItem) {
  return 'TODO';
}

function usePreviousItem(item: HistoryItem) {
  if (item.type !== 'state-set') {
    return null;
  }

  const typedItem = item as StateHistoryItem;
  if (!typedItem.previousItem) {
    return null;
  }


}

function formatTimestamp(value: Date) {
  return value.toLocaleString('fr-FR');
}

function formatValue(value: any) {
  if (value === undefined || value === null) {
    return '';
  }
  return JSON.stringify(value);
}
*/
function useItem(id: string) {
  return useSelector((appState: AppState) => getItem(appState, id));
}

const renderers = {
  type: (id: string) => (<Type id={id} />),
  timestamp: (id: string) => (<Timestamp id={id} />),
  instanceName: (id: string) => (<InstanceName id={id} />),
  componentId: (id: string) => (<ComponentId id={id} />),
  stateName: (id: string) => (<StateName id={id} />),
  stateValue: (id: string) => (<StateValue id={id} />),
};

const cellDataGetter = ({ rowData }: TableCellDataGetterParams) => rowData;

const columns: ColumnDefinition[] = [
  { dataKey: 'type', width: 50, headerRenderer: 'Type', cellDataGetter, cellRenderer: renderers.type },
  { dataKey: 'timestamp', width: 150, headerRenderer: 'Date/Heure', cellDataGetter, cellRenderer: renderers.timestamp },
  { dataKey: 'instanceName', headerRenderer: 'Instance', cellDataGetter, cellRenderer: renderers.instanceName },
  { dataKey: 'componentId', headerRenderer: 'Composant', cellDataGetter, cellRenderer: renderers.componentId },
  { dataKey: 'stateName', headerRenderer: 'État', cellDataGetter, cellRenderer: renderers.stateName },
  { dataKey: 'stateValue', headerRenderer: 'Nouvelle valeur', cellDataGetter, cellRenderer: renderers.stateValue },
  /*
  { dataKey: 'previousValue', headerRenderer: 'Ancienne valeur', cellDataGetter, cellDataGetter: ({ rowData }) => rowData, cellRenderer: previousValueRenderer },
  { dataKey: 'valueDuration', headerRenderer: 'Durée', cellDataGetter, cellDataGetter: ({ rowData }) => rowData, cellRenderer: valueDurationRenderer },
  */
];

const List: FunctionComponent<{ className?: string; itemsIds: string[]; }> = ({ className, itemsIds }) => (
  <VirtualizedTable data={itemsIds} columns={columns} className={className} />
);

export default List;
