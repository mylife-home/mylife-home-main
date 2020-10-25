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
import { InstanceIcon, ComponentIcon, StateIcon } from '../../lib/icons';
import { HistoryItem, HistoryItemType, StateHistoryItem } from '../../../store/online-history/types';
import { getItem } from '../../../store/online-history/selectors';

import Type from './type';

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
};

const cellDataGetter = ({ rowData }: TableCellDataGetterParams) => rowData;

const columns: ColumnDefinition[] = [
  { dataKey: 'type', width: 50, headerRenderer: 'Type', cellDataGetter, cellRenderer: renderers.type },
  /*
  { dataKey: 'time', width: 150, headerRenderer: 'Date/Heure', cellDataGetter, cellDataGetter: ({ rowData }) => formatTimestamp(rowData.timestamp) },
  { dataKey: 'instanceName', headerRenderer: 'Instance', cellDataGetter },
  { dataKey: 'componentId', headerRenderer: 'Composant', cellDataGetter },
  { dataKey: 'stateName', headerRenderer: 'État', cellDataGetter },
  { dataKey: 'stateValue', headerRenderer: 'Nouvelle valeur', cellDataGetter, cellDataGetter: ({ rowData }) => formatValue(rowData.stateValue) },
  { dataKey: 'previousValue', headerRenderer: 'Ancienne valeur', cellDataGetter, cellDataGetter: ({ rowData }) => rowData, cellRenderer: previousValueRenderer },
  { dataKey: 'valueDuration', headerRenderer: 'Durée', cellDataGetter, cellDataGetter: ({ rowData }) => rowData, cellRenderer: valueDurationRenderer },
  */
];

const List: FunctionComponent<{ className?: string; itemsIds: string[]; }> = ({ className, itemsIds }) => (
  <VirtualizedTable data={itemsIds} columns={columns} className={className} />
);

export default List;
