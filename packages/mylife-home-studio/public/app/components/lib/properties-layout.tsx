import React, { ReactNode, FunctionComponent, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Collapse from '@material-ui/core/Collapse';
import IconButton from '@material-ui/core/IconButton';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';

const useStyles = makeStyles((theme) => ({
  group: {
    margin: theme.spacing(3),
    display: 'flex',
    flexDirection: 'column',
  },
  collapsibleTitle: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',

    '& > :first-child': {
      flex: 1,
    }
  },
  item: {
    margin: theme.spacing(1),
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemTitle: {
    display: 'flex',
    width: 150,
  }
}), { name: 'properties-layout' });

export const Group: FunctionComponent<{ title: string; collapse?: boolean; }> = ({ title, collapse, children }) => {
  const classes = useStyles();
  const [open, setOpen] = useState(true);

  if(collapse) {
    return (
      <div className={classes.group}>
        <div className={classes.collapsibleTitle}>
          <Typography variant="h6">{title}</Typography>
          <IconButton onClick={() => setOpen(value => !value)}>
            {open ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </div>

        <Collapse in={open} timeout="auto" unmountOnExit>
          {children}
        </Collapse>
      </div>
    );
  } else {
    return (
      <div className={classes.group}>
        <Typography variant="h6">{title}</Typography>
        {children}
      </div>
    );
  }
};

export const Item: FunctionComponent<{ title?: ReactNode }> = ({ title, children }) => {
  const classes = useStyles();

  return (
    <div className={classes.item}>
      {title && (
        <Typography className={classes.itemTitle}>{title}</Typography>
      )}
      {children}
    </div>
  );
};

export const useComponentStyles = makeStyles((theme) => ({
  component: {
    flex: 1,
  },
}));