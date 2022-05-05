import React, { ChangeEvent, FunctionComponent, useState } from 'react';
import { useSelector } from 'react-redux';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';

import { AppState } from '../../../../store/types';
import { getStyle } from '../../../../store/ui-designer/selectors';
import { setStyle } from '../../../../store/ui-designer/actions';

const useStyles = makeStyles((theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
  }
}));

const Display : FunctionComponent<{ id: string; className?: string; }> = ({ id, className }) => {
  const classes = useStyles();
  const style = useSelector((state: AppState) => getStyle(state, id));

  return (
    <div className={clsx(className, classes.container)}>
      TODO
    </div>
  );
};

export default Display;