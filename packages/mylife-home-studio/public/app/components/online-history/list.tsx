import React, { FunctionComponent } from 'react';
import Typography from '@material-ui/core/Typography';
import Tooltip from '@material-ui/core/Tooltip';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import SearchIcon from '@material-ui/icons/Search';

import VirtualizedTable, { ColumnDefinition } from '../lib/virtualized-table';
import { HistoryItem } from '../../store/online-history/types';
import { makeStyles } from '@material-ui/core';

const Text: FunctionComponent<{ value: string }> = ({ value }) => (
  <Typography variant='body2' noWrap>
    {value}
  </Typography>
);

const List: FunctionComponent<{ className?: string; data: HistoryItem[]; }> = ({ className, data }) => {
  const textRenderer = (value: string) => (
    <Text value={value} />
  );

  const columns: ColumnDefinition[] = [
    { dataKey: 'time', width: 150, headerRenderer: 'Date/Heure', cellDataGetter: ({ rowData }) => formatTimestamp(rowData.timestamp) },
    { dataKey: 'type', width: 200, headerRenderer: 'Type' },
  ];

  return (
    <VirtualizedTable data={data} columns={columns} className={className} />
  );
};

export default List;

function formatTimestamp(value: Date) {
  return value.toLocaleString('fr-FR');
}
