import React, { FunctionComponent, useCallback, useState } from 'react';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';

import Checkbox from '@material-ui/core/Checkbox';
import TextField from '@material-ui/core/TextField';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormGroup from '@material-ui/core/FormGroup';
import Button, { ButtonProps } from '@material-ui/core/Button';
import Popper from '@material-ui/core/Popper';
import Paper from '@material-ui/core/Paper';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';

type LevelSelectorButtonProps = Omit<ButtonProps, 'children'> & { min: number, max: number };

const LevelSelectorButton: FunctionComponent<LevelSelectorButtonProps> = ({ min, max, ...props }) => {

  return (
    <Button {...props}>
      {`${min} - ${max}`}
    </Button>
  );
};

type LevelSelectorProps = Omit<ButtonProps, 'onClick' | 'children'> & { min: number, max: number, set: (min: number, max: number) => void };

interface LevelSelectorPopupProps {
  min: number;
  max: number;
  set: (min: number, max: number) => void;
  onClose: () => void;
  anchorEl: HTMLElement;
}

const LevelSelectorPopup: FunctionComponent<LevelSelectorPopupProps> = ({ min, max, set, onClose, anchorEl }) => {
  return (
    <Popper open={!!anchorEl} anchorEl={anchorEl}>
      <ClickAwayListener onClickAway={onClose}>
        <Paper>
          TODO
        </Paper>
      </ClickAwayListener>
    </Popper>
  );
};

const LevelSelector: FunctionComponent<LevelSelectorProps> = ({ min, max, set, ...props }) => {

  const [anchorEl, setAnchorEl] = useState<HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClickAway = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <LevelSelectorPopup min={min} max={max} set={set} anchorEl={anchorEl} onClose={handleClickAway} />

      <LevelSelectorButton min={min} max={max} {...props} onClick={handleClick} />
    </>
  );
};

export default LevelSelector;
