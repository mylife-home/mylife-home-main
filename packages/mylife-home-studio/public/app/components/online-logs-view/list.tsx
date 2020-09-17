import React, { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';

import { getItems } from '../../store/online-logs-view/selectors';
import VirtualizedTable, { ColumnDefinition } from '../lib/virtualized-table';

interface ListProps {
  className?: string;
}

const List: FunctionComponent<ListProps> = ({ className }) => {
  const { data } = useConnect();

  const columns: ColumnDefinition[] = [
    { dataKey: 'time', width: 150, headerRenderer: 'Date/Heure', cellDataGetter: ({ rowData }) => formatTimestamp(rowData.time) },
    { dataKey: 'level', width: 150, headerRenderer: 'Niveau', cellDataGetter: ({ rowData }) => JSON.stringify(rowData.level) }, // TODO
    { dataKey: 'instanceName', width: 300, headerRenderer: 'Instance' },
    { dataKey: 'name', headerRenderer: 'Nom' },
    { dataKey: 'msg', headerRenderer: 'Message' },
    { dataKey: 'err', headerRenderer: 'Erreur', cellDataGetter: ({ rowData }) => JSON.stringify(rowData.err) }, // TODO
  ];

  return (
    <VirtualizedTable data={data} columns={columns} className={className} />
  );
};

export default List;

function useConnect() {
  return {
    data: useSelector(getItems)
  };
}

function formatTimestamp(value: Date) {
  return value.toLocaleString('fr-FR');
}
