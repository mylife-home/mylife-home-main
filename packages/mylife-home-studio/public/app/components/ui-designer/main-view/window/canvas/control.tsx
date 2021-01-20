import React, { FunctionComponent } from 'react';

import { useControlState } from '../window-state';
import CanvasItem from './item';
import { CanvasControlView } from './view';

const CanvasControl: FunctionComponent<{ id: string }> = ({ id }) => {
  const { control, update, selected, select } = useControlState(id);

  return (
    <CanvasItem
      id={id}
      size={{ width: control.width, height: control.height }}
      position={{ x: control.x, y: control.y }}
      selected={selected}
      onResize={(size) => update(size)}
      onMove={(position) => update(position)}
      onSelect={select}
    >
      <CanvasControlView id={id} />
    </CanvasItem>
  );
};

export default CanvasControl;
