import React, { forwardRef, FunctionComponent } from 'react';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';

import Toolbar from '@material-ui/core/Toolbar';
import Popover from '@material-ui/core/Popover';

const STATUS_HEIGHT = 24;

const useStyles = makeStyles((theme) => ({
  root: {
    minHeight: STATUS_HEIGHT,
    height: STATUS_HEIGHT,

    // backgroundColor: theme.palette.grey[100],
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,

    '& > *': {
      marginLeft: theme.spacing(4),
      marginRight: theme.spacing(4),
    },
  },
  separator: {
    flex: 1,
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    height: '100%',
  },
  popover: {
    pointerEvents: 'none',
  },
  popoverPaper: {
    padding: theme.spacing(1),
  },
}));

const StatusBar: FunctionComponent<{ className?: string }> = ({ className, children }) => {
  const classes = useStyles();

  return (
    <Toolbar className={clsx(className, classes.root)} disableGutters>
      {children}
    </Toolbar>
  );
};

export default StatusBar;

export const StatusSeparator: FunctionComponent = () => {
  const classes = useStyles();

  return <div className={classes.separator} />;
};

export const StatusItem = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => {
  const classes = useStyles();

  return <div ref={ref} className={clsx(className, classes.item)} {...props} />;
});

export const StatusItemWithPopover: FunctionComponent<React.HTMLAttributes<HTMLDivElement> & { popover: React.ReactNode }> = ({ popover, ...props }) => {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement>(null);

  const handlePopoverOpen = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <StatusItem onMouseEnter={handlePopoverOpen} onMouseLeave={handlePopoverClose} {...props} />

      <Popover
        className={classes.popover}
        classes={{ paper: classes.popoverPaper }}
        open={!!anchorEl}
        anchorEl={anchorEl}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        onClose={handlePopoverClose}
        disableRestoreFocus
      >
        {popover}
      </Popover>
    </>
  );
};
