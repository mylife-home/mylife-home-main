import React, { FunctionComponent } from 'react';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import TextFieldsIcon from '@material-ui/icons/TextFields';

import { useControlState } from './use-control-state';
import { useSelection } from './selection';
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
  const { control, /*updater,*/ } = useControlState(id);
  const { selection, select } = useSelection();
  const classes = useStyles();
  const selected = selection === id;

  const updater = (arg: any) => {};

  return (
    <div onClick={(e) => { e.stopPropagation(); select(id); }}>
      <RndBox size={{ width: control.width, height: control.height}} position={{ x: control.x, y: control.y}} onResize={(size) => updater(size)} onMove={(position) => updater(position)}>
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
