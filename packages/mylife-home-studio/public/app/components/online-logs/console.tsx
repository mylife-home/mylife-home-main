import React, { FunctionComponent } from 'react';
import { makeStyles, darken } from '@material-ui/core/styles';
import clsx from 'clsx';

import { addLineBreaks } from '../lib/add-line-breaks';
import { LogItem, LogError } from '../../store/online-logs/types';
import { findLevelByValue, useLevelStyles, getLevelClass } from './levels';

const useStyles = makeStyles((theme) => ({
  list: {
    overflowY: 'auto',
  },
  row: {
    marginLeft: theme.spacing(2),
    fontFamily: 'monospace',
    fontSize: 12,
    display: 'inline',
    whiteSpace: 'pre-wrap',
    overflowWrap: 'break-word',
  },
  timestamp: {
    color: darken(theme.palette.background.paper, 0.5),
  },
  level: {

  },
  location: {
    color: darken(theme.palette.background.paper, 0.5),
  },
  message: {

  },
  error: {
    color: theme.palette.error.main,
  }
}));

const Console: FunctionComponent<{ className?: string; data: LogItem[]; }> = ({ className, data }) => {
  const classes = useStyles();

  return (
    <div className={clsx(className, classes.list)}>
      {data.map(item => (
        <span key={item.id} className={classes.row}>
          <Timestamp value={item.time} />
          <Space />
          <Level value={item.level} />
          <Space />
          <Location instanceName={item.instanceName} name={item.name} />
          <Space />
          <Message value={item.msg} />
          {item.err && (
            <>
              <Space />
              <Error value={item.err} />
            </>
          )}
          <LineEnd />
        </span>
      ))}
    </div>
  );
};

export default Console;

const Timestamp: FunctionComponent<{ value: Date }> = ({ value }) => {
  const classes = useStyles();
  return (
    <span className={classes.timestamp}>
      {value.toLocaleString('fr-FR')}
    </span>
  );
};

const Level: FunctionComponent<{ value: number }> = ({ value }) => {
  const classes = useStyles();
  const levelClasses = useLevelStyles();
  const level = findLevelByValue(value);
  const levelClass = getLevelClass(levelClasses, level);
  const levelDisplay = level ? level.id.toUpperCase() : `${value}`;

  return (
    <span className={clsx(classes.level, levelClass)}>
      {levelDisplay}
    </span>
  );
};

const Location: FunctionComponent<{ instanceName: string; name: string; }> = ({ instanceName, name }) => {
  const classes = useStyles();
  return (
    <span className={classes.location}>
      {`${name}@${instanceName}`}
    </span>
  );
};

const Message: FunctionComponent<{ value: string }> = ({ value }) => {
  const classes = useStyles();
  return (
    <span className={classes.message}>
      {value}
    </span>
  );
};

const Error: FunctionComponent<{ value: LogError }> = ({ value }) => {
  const classes = useStyles();
  return (
    <span className={classes.error}>
      {addLineBreaks(value.stack)}
    </span>
  );
};

const Space: FunctionComponent = () => {
  return (
    <span>
      {' '}
    </span>
  );
};

const LineEnd: FunctionComponent = () => {
  return (
    <span>
      {'\n'}
    </span>
  );
};
