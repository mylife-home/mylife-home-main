import React, { FunctionComponent, ReactElement } from 'react';
import clsx from 'clsx';
import { AutoSizer, Column, Table } from 'react-virtualized';
import { TableCell, makeStyles } from '@material-ui/core';

const useStyles = makeStyles(theme => ({
  container: {
    display: 'flex',
    alignItems: 'center',
    boxSizing: 'border-box'
  },
  row: {
  },
  clickableRow: {
    // https://github.com/mui-org/material-ui/blob/master/packages/material-ui/src/TableRow/TableRow.js
    '&:hover': {
      cursor: 'pointer',
      backgroundColor:
        theme.palette.type === 'light'
          ? 'rgba(0, 0, 0, 0.07)' // grey[200]
          : 'rgba(255, 255, 255, 0.14)',
    }
  },
  cell: {
    flex: 1
  }
}));

export interface ColumnDefinition {
  dataKey: string;
  cellRenderer?: ReactElement | string;
  cellClassName?: string;
  headerRenderer: ReactElement | string;
  headerClassName?: string;
  width?: number;
  headerProps?: object;
  cellProps?: object;
}

export interface VirtualizedTableProps {
  className?: string;
  data: any[];
  rowClassName?: string;
  columns: ColumnDefinition[];
  rowHeight?: number;
  headerHeight?: number;
  onRowClick?: (rowData: any, rowIndex: any) => void;
}

const VirtualizedTable: FunctionComponent<VirtualizedTableProps> = ({ data, columns, rowClassName, headerHeight = 48, rowHeight = 48, onRowClick, ...props }) => {
  const classes = useStyles();
  const rowIndexClassName = (({ index }: { index: number }) => clsx(classes.container, classes.row, classes.clickableRow, runPropGetter(rowClassName, data[index], index)));
  const rowGetter = ({ index }: { index: number }) => data[index];

  return (
    <div {...props}>
      <AutoSizer>
        {({ height, width }) => (
          <Table height={height} width={width} rowClassName={rowIndexClassName} rowGetter={rowGetter} rowCount={data.length} rowHeight={rowHeight} headerHeight={headerHeight}>
            {columns.map(({ dataKey, headerRenderer, headerClassName, cellRenderer, cellClassName, width: colWidth, headerProps, cellProps, ...props }) => {
              if (!colWidth) {
                colWidth = computeColumnWidth(width, columns);
              }

              return (
                <Column
                  key={dataKey}
                  dataKey={dataKey}
                  headerRenderer={() => (
                    <TableCell component='div' className={clsx(classes.container, classes.cell, runPropGetter(headerClassName, dataKey))} variant='head' style={{ height: headerHeight }} {...runPropGetter(headerProps, dataKey)}>
                      {runRenderer(headerRenderer, dataKey)}
                    </TableCell>
                  )}
                  cellRenderer={({ rowData, cellData, rowIndex }) => (
                    <TableCell onClick={onRowClick && (() => onRowClick(rowData, rowIndex))} component='div' className={clsx(classes.container, classes.cell, runPropGetter(cellClassName, cellData, dataKey))} variant='body' style={{ height: rowHeight }} {...runPropGetter(cellProps, cellData, dataKey)}>
                      {runRenderer(cellRenderer || identity, cellData, dataKey)}
                    </TableCell>
                  )}
                  width={colWidth}
                  {...props}
                />
              );
            })}
          </Table>
        )}
      </AutoSizer>
    </div>
  );
};

export default VirtualizedTable;

function identity<T>(x: T) {
  return x;
}

function computeColumnWidth(tableWidth: number, columns: ColumnDefinition[]) {
  // compute space left
  let unsetCount = columns.length;
  let specLeft = tableWidth;
  for(const { width } of columns) {
    if(!width) {
      continue;
    }
    --unsetCount;
    specLeft -= width;
  }

  const colWidth = specLeft / unsetCount;
  return Math.max(0, colWidth);
}

function runRenderer<T>(value: T | ((...args: any[]) => T), ...args: any[]) {
  value = runPropGetter(value, ...args);

  if(typeof value !== 'string') {
    return value;
  }
  return (
    <React.Fragment>
      {value}
    </React.Fragment>
  );
}

function runPropGetter<T>(value: T | ((...args: any[]) => T), ...args: any[]) {
  if(!value) {
    return;
  }
  if(value instanceof Function) {
    value = value(...args);
  }
  return value;
}
