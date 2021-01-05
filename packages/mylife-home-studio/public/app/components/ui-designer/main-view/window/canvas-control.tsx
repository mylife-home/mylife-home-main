import React, { FunctionComponent } from 'react';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import TextFieldsIcon from '@material-ui/icons/TextFields';

import { useControlState } from './window-state';
import RndBox from './rnd-box';
import Image from './image';

const useStyles = makeStyles((theme) => ({
  // TODO: merge with window
  control: {
    height: '100%',
    width: '100%',
    border: `1px solid ${theme.palette.divider}`,
    position: 'relative',
  },
  selected: {
    border: `1px solid ${theme.palette.primary.main}`,
  },
  item: {
    height: '100%',
    width: '100%'
  }
}));

const CanvasControl: FunctionComponent<{ id: string; }> = ({ id }) => {
  const { control, update, selected, select } = useControlState(id);
  const classes = useStyles();

  return (
    <div onClick={(e) => { e.stopPropagation(); select(); }}>
      <RndBox size={{ width: control.width, height: control.height}} position={{ x: control.x, y: control.y}} onResize={(size) => update(size)} onMove={(position) => update(position)}>
        <div className={clsx(classes.control, selected && classes.selected)}>
          {control.text ?
            (<TextFieldsIcon className={classes.item} />)
          : (<Image resource={control.display.defaultResource} className={classes.item}/>)}
        </div>
      </RndBox>
    </div>
  );
};

export default CanvasControl;
