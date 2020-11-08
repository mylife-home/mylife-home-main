import React, { FunctionComponent } from 'react';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import SvgIcon from '@material-ui/core/SvgIcon';
import Typography from '@material-ui/core/Typography';

const useTitleStyles = makeStyles((theme) => ({
  container: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: theme.spacing(3),

    '& *': {
      marginRight: theme.spacing(3),
    }
  }
}));

export const Title: FunctionComponent<{ className?: string; text: string; icon?: typeof SvgIcon }> = ({ className, text, icon }) => {
  const classes = useTitleStyles();
  const Icon = icon || React.Fragment;

  return (
    <div className={clsx(classes.container, className)}>
      <Icon />
      <Typography variant='h6' >
        {text}
      </Typography>
    </div>
  );
};
