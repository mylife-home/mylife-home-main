import React, { ReactNode, FunctionComponent, useState } from 'react';
import clsx from 'clsx';
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
  },
  multilineTitle: {
    alignSelf: 'flex-start'
  },
  multilineWrapper: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
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

export const Item: FunctionComponent<{ title?: ReactNode; multiline?: boolean; noTitleTypography?: boolean }> = ({ title, multiline = false, noTitleTypography = false, children }) => {
  const classes = useStyles();

  return (
    <div className={classes.item}>
      {getTitleElement(classes, title, multiline, noTitleTypography)}

      {multiline ? (
        <div className={classes.multilineWrapper}>
          {children}
        </div>
      ) : children}
    </div>
  );
};

function getTitleElement(classes: ReturnType<typeof useStyles>, title: ReactNode, multiline: boolean, noTitleTypography: boolean) {
  if (!title) {
    return null;
  }

  const titleClass = clsx(classes.itemTitle, multiline && classes.multilineTitle);
  return noTitleTypography ? <div className={titleClass}>{title}</div> : <Typography className={titleClass}>{title}</Typography>
}

export const useComponentStyles = makeStyles((theme) => ({
  component: {
    flex: 1,
  },
}));