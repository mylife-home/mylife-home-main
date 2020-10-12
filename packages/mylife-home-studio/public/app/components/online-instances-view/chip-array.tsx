import React, { FunctionComponent } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import Chip from '@material-ui/core/Chip';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexWrap: 'wrap',
    listStyle: 'none',
    padding: 0,
    margin: 0,
    gap: theme.spacing(1) + 'px', // wait for https://github.com/cssinjs/jss/pull/1403
  },
}));

const ChipArray: FunctionComponent<{ values: string[] }> = ({ values }) => {
  const classes = useStyles();
  return (
    <ul className={classes.root}>
      {values.map((item, index) => (
        <li key={index}>
          <Chip size='small' label={item} />
        </li>
      ))}
    </ul>
  );
};

export default ChipArray;
