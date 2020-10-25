import React, { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';
import { TableCellDataGetterParams } from 'react-virtualized';
import humanizeDuration from 'humanize-duration';
import Tooltip from '@material-ui/core/Tooltip';

import VirtualizedTable, { ColumnDefinition } from '../lib/virtualized-table';
import { AppState } from '../../store/types';
import { ComponentHistoryItem, InstanceHistoryItem, StateHistoryItem } from '../../store/online-history/types';
import { getItem } from '../../store/online-history/selectors';
import { TypeIcon, TypeLabel } from './types';

const List: FunctionComponent<{ className?: string; itemsIds: string[]; }> = ({ className, itemsIds }) => (
  <VirtualizedTable data={itemsIds} columns={columns} className={className} />
);

export default List;

const Type: FunctionComponent<{ id: string }> = ({ id }) => {
  const item = useItem(id);

  return (
    <Tooltip title={<TypeLabel type={item.type} />}>
      <TypeIcon type={item.type} />
    </Tooltip>
  );
};

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

const PreviousValue: FunctionComponent<{ id: string; }> = ({ id }) => {
  const { previousItem } = useStateItemAndPrev(id);

  if (!previousItem) {
    return null;
  }

  const value = JSON.stringify(previousItem.stateValue);
  return (<>{value}</>);
};

const ValueDuration: FunctionComponent<{ id: string; }> = ({ id }) => {
  const { item, previousItem } = useStateItemAndPrev(id);

  if (!previousItem) {
    return null;
  }

  const duration = item.timestamp.valueOf() - previousItem.timestamp.valueOf();
  const value = humanizeDuration(duration, { language: 'fr', largest: 2, round: true });
  return (<>{value}</>);
};

const renderers = {
  type: (id: string) => (<Type id={id} />),
  timestamp: (id: string) => (<Timestamp id={id} />),
  instanceName: (id: string) => (<InstanceName id={id} />),
  componentId: (id: string) => (<ComponentId id={id} />),
  stateName: (id: string) => (<StateName id={id} />),
  stateValue: (id: string) => (<StateValue id={id} />),
  previousValue: (id: string) => (<PreviousValue id={id} />),
  valueDuration: (id: string) => (<ValueDuration id={id} />),
};

const cellDataGetter = ({ rowData }: TableCellDataGetterParams) => rowData;

const columns: ColumnDefinition[] = [
  { dataKey: 'type', width: 50, headerRenderer: 'Type', cellDataGetter, cellRenderer: renderers.type },
  { dataKey: 'timestamp', width: 150, headerRenderer: 'Date/Heure', cellDataGetter, cellRenderer: renderers.timestamp },
  { dataKey: 'instanceName', headerRenderer: 'Instance', cellDataGetter, cellRenderer: renderers.instanceName },
  { dataKey: 'componentId', headerRenderer: 'Composant', cellDataGetter, cellRenderer: renderers.componentId },
  { dataKey: 'stateName', headerRenderer: 'État', cellDataGetter, cellRenderer: renderers.stateName },
  { dataKey: 'stateValue', headerRenderer: 'Nouvelle valeur', cellDataGetter, cellRenderer: renderers.stateValue },
  { dataKey: 'previousValue', headerRenderer: 'Ancienne valeur', cellDataGetter, cellRenderer: renderers.previousValue },
  { dataKey: 'valueDuration', headerRenderer: 'Durée', cellDataGetter, cellRenderer: renderers.valueDuration },
];

function useItem(id: string) {
  return useSelector((appState: AppState) => getItem(appState, id));
}

function useStateItemAndPrev(id: string) {
  const rawItem = useItem(id);
  const item = rawItem.type === 'state-set' ? rawItem as StateHistoryItem : null;
  const prevItemId = item && item.previousItemId || null;
  const previousItem = useItem(prevItemId) as StateHistoryItem; // cannot call this in a if
  return { item, previousItem };
}