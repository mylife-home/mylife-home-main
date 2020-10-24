import React, { FunctionComponent } from 'react';
import Typography from '@material-ui/core/Typography';
import Tooltip from '@material-ui/core/Tooltip';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import SearchIcon from '@material-ui/icons/Search';

import VirtualizedTable, { ColumnDefinition } from '../lib/virtualized-table';
import { LogItem, LogError } from '../../store/online-logs/types';
import { findLevelByValue, useLevelStyles, getLevelClass } from './levels';
import { makeStyles } from '@material-ui/core';

const Level: FunctionComponent<{ value: number }> = ({ value }) => {
  const classes = useLevelStyles();
  const level = findLevelByValue(value);

  type Ids = 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace';
  const levelClass = getLevelClass(classes, level);
  const levelDisplay = level ? level.id.toUpperCase() : `${value}`;

  return (
    <Typography className={levelClass} variant='body2'>
      {levelDisplay}
    </Typography>
  );
};

const Text: FunctionComponent<{ value: string }> = ({ value }) => (
  <Typography variant='body2' noWrap>
    {value}
  </Typography>
);

const useErrorStyles = makeStyles((theme) => ({
  tooltip: {
    backgroundColor: theme.palette.common.white,
    color: 'rgba(0, 0, 0, 0.87)',
    boxShadow: theme.shadows[1],
    maxWidth: 'calc(100% - 64px)'
  },
}))

const Error: FunctionComponent<{ value: LogError }> = ({ value }) => {
  const classes = useErrorStyles();

  if(!value) {
    return null;
  }

  return (
    <Tooltip classes={{ tooltip: classes.tooltip }} title={
      <>
        <DialogTitle>
          {value.message}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {addLineBreaks(value.stack)}
          </DialogContentText>
        </DialogContent>
      </>
    }>
      <SearchIcon/>
    </Tooltip>
  )
};

const List: FunctionComponent<{ className?: string; data: LogItem[]; }> = ({ className, data }) => {
  const levelRenderer = (value: number) => (
    <Level value={value} />
  );

  const textRenderer = (value: string) => (
    <Text value={value} />
  );

  const errorRenderer = (value: LogError) => (
    <Error value={value} />
  );

  const columns: ColumnDefinition[] = [
    { dataKey: 'time', width: 150, headerRenderer: 'Date/Heure', cellDataGetter: ({ rowData }) => formatTimestamp(rowData.time) },
    { dataKey: 'level', width: 100, headerRenderer: 'Niveau', cellRenderer: levelRenderer },
    { dataKey: 'instanceName', width: 200, headerRenderer: 'Instance' },
    { dataKey: 'name', width: 500, headerRenderer: 'Nom' },
    { dataKey: 'msg', headerRenderer: 'Message', cellRenderer: textRenderer },
    { dataKey: 'err', width: 100, headerRenderer: 'Erreur', cellRenderer: errorRenderer },
  ];

  return (
    <VirtualizedTable data={data} columns={columns} className={className} />
  );
};

export default List;

function formatTimestamp(value: Date) {
  return value.toLocaleString('fr-FR');
}

function addLineBreaks(values: string | string[]) {
  if(typeof values === 'string') {
    values = values.split('\n');
  }
  
  return values.map((text, index) => (
    <React.Fragment key={index}>
      {text}
      {index < values.length -1 && (
        <br />
      )}
    </React.Fragment>
  ));
}
