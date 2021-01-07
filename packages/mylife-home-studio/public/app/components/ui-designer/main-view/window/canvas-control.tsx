import React, { FunctionComponent } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import { TextIcon } from '../../../lib/icons';
import { useControlState } from './window-state';
import CanvasItem from './canvas-item';
import Image from './image';

const useStyles = makeStyles((theme) => ({
  content: {
    height: '100%',
    width: '100%',
  },
}));

const CanvasControl: FunctionComponent<{ id: string }> = ({ id }) => {
  const { control, update, selected, select } = useControlState(id);
  const classes = useStyles();

  return (
    <CanvasItem
      size={{ width: control.width, height: control.height }}
      position={{ x: control.x, y: control.y }}
      selected={selected}
      onResize={(size) => update(size)}
      onMove={(position) => update(position)}
      onSelect={select}
    >
      {control.text ? <TextIcon className={classes.content} /> : <Image resource={control.display.defaultResource} className={classes.content} />}
    </CanvasItem>
  );
};

export default CanvasControl;
