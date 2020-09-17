import React, { FunctionComponent } from 'react';
import VirtualizedTable, { ColumnDefinition } from '../lib/virtualized-table';
import { LogItem } from '../../store/online-logs-view/types';

interface ListProps {
  data: LogItem[];
  className?: string;
}

const List: FunctionComponent<ListProps> = ({ data, className }) => {
  const columns: ColumnDefinition[] = [
    { dataKey: 'time', width: 150, headerRenderer: 'Date/Heure', cellDataGetter: ({ rowData }) => formatTimestamp(rowData.time) },
    { dataKey: 'level', width: 150, headerRenderer: 'Niveau', cellDataGetter: ({ rowData }) => JSON.stringify(rowData.level) }, // TODO
    { dataKey: 'instanceName', width: 200, headerRenderer: 'Instance' },
    { dataKey: 'name', headerRenderer: 'Nom' },
    { dataKey: 'msg', headerRenderer: 'Message' },
    { dataKey: 'err', headerRenderer: 'Erreur', cellDataGetter: ({ rowData }) => JSON.stringify(rowData.err) }, // TODO
  ];

  return (
    <VirtualizedTable data={data} columns={columns} className={className} />
  );
};

export default List;

function formatTimestamp(value: Date) {
  return value.toLocaleString('fr-FR');
}
