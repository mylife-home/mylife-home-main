import React, { FunctionComponent, useState } from 'react';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import Popper from '@material-ui/core/Popper';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import DeleteIcon from '@material-ui/icons/Delete';

const useStyles = makeStyles((theme) => ({
  iconButton: {
    color: theme.palette.error.main,
  },
  button: {
    color: theme.palette.getContrastText(theme.palette.error.main),
    backgroundColor: theme.palette.error.main,
    '&:hover': {
      backgroundColor: theme.palette.error.dark,
    },
  },
  paper: {
    padding: theme.spacing(2),
    '& > *': {
      margin: theme.spacing(2),
    },
  },
}));

export interface DeleteButtonProps {
  icon?: boolean;
  text?: string;
  disabled?: boolean;
  tooltip?: string;
  confirmText?: string;
  onConfirmed: () => void;
  className?: string;
  disablePortal?: boolean;
}

const DeleteButton: FunctionComponent<DeleteButtonProps> = ({
  icon = false,
  text = null,
  disabled = false,
  tooltip = null,
  confirmText = 'Etes-vous sûr ?',
  onConfirmed,
  className,
  disablePortal,
}) => {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = useState<HTMLElement>(null);
  const [tooltipOpen, setTooltipOpen] = useState(false);

  const handleButtonClick = (e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);
  const handleConfirm = () => {
    handleClose();
    onConfirmed && onConfirmed();
  };

  const handleTooltipOpen = () => setTooltipOpen(true);
  const handleTooltipClose = () => setTooltipOpen(false);
  const isTooltipOpen = tooltipOpen && !anchorEl; // do not show tooltip when popup is shown

  let button = text ? (
    <Button variant="contained" disabled={disabled} className={clsx(classes.button, className)} onClick={handleButtonClick} startIcon={icon ? <DeleteIcon /> : null}>
      {text}
    </Button>
  ) : (
    <IconButton disabled={disabled} className={clsx(classes.iconButton, className)} onClick={handleButtonClick}>
      <DeleteIcon />
    </IconButton>
  );

  if (tooltip) {
    button = (
      <Tooltip title={tooltip} open={isTooltipOpen} onOpen={handleTooltipOpen} onClose={handleTooltipClose}>
        {button}
      </Tooltip>
    );
  }

  return (
    <>
      {button}
      <Popper open={!!anchorEl} anchorEl={anchorEl} disablePortal={disablePortal} style={{ zIndex: 10000 }}>
        <ClickAwayListener onClickAway={handleClose}>
          <Paper className={classes.paper}>
            <Typography>{confirmText}</Typography>
            <Button variant="contained" className={classes.button} onClick={handleConfirm}>
              {'Supprimer'}
            </Button>
          </Paper>
        </ClickAwayListener>
      </Popper>
    </>
  );
};

export default DeleteButton;
