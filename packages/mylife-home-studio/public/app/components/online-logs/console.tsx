import React, { FunctionComponent } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Tooltip from '@material-ui/core/Tooltip';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import SearchIcon from '@material-ui/icons/Search';

import { addLineBreaks } from '../lib/add-line-breaks';
import VirtualizedTable, { ColumnDefinition } from '../lib/virtualized-table';
import { LogItem, LogError } from '../../store/online-logs/types';
import { findLevelByValue, useLevelStyles, getLevelClass } from './levels';

const Console: FunctionComponent<{ className?: string; data: LogItem[]; }> = ({ className, data }) => {

  return (
    <div className={className}>
      console
    </div>
  );
};

export default Console;
