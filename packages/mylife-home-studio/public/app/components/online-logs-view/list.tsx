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
    { dataKey: 'msg', headerRenderer: 'Message' },
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
