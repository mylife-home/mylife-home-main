import React, { FunctionComponent, useCallback, useState } from 'react';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';

import Checkbox from '@material-ui/core/Checkbox';
import TextField from '@material-ui/core/TextField';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormGroup from '@material-ui/core/FormGroup';
import Button from '@material-ui/core/Button';
import Popper from '@material-ui/core/Popper';
import Paper from '@material-ui/core/Paper';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';

const LevelSelector: FunctionComponent<{ min: number, max: number, set: (min: number, max: number) => void }> = ({ min, max, set }) => {

  const [anchorEl, setAnchorEl] = useState<HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClickAway = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <Popper open={!!anchorEl} anchorEl={anchorEl}>
        <ClickAwayListener onClickAway={handleClickAway}>
          <Paper>
            TODO
          </Paper>
        </ClickAwayListener>
      </Popper>

      <Button onClick={handleClick}>
        {`${min} - ${max}`}
      </Button>
    </>
  );
};

export default LevelSelector;