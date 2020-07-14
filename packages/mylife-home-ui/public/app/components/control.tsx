import React, { FunctionComponent } from 'react';
import { VControl } from '../store/types/model';
import { useInputActions } from '../behaviors/input-actions';

type ControlProps = {
  control: VControl;
  onActionPrimary: () => void;
  onActionSecondary: () => void;
};

const Control: FunctionComponent<ControlProps> = ({ control, onActionPrimary, onActionSecondary }) => {
  const { onTouchStart, onTouchEnd, onMouseDown, onMouseUp } = useInputActions(onActionPrimary, onActionSecondary);
  return (
    <div
    title={control.id}
    style={getStyleSizePosition(control)}
    className={control.active ? 'mylife-control-button' : 'mylife-control-inactive'}
    onTouchStart={onTouchStart}
    onTouchEnd={onTouchEnd}
    onMouseDown={onMouseDown}
    onMouseUp={onMouseUp}
  >
    {control.display && <img src={`/resources/${control.display}`} />}
    {control.text && <p>{control.text}</p>}
  </div>
  )
};


function getStyleSizePosition(control: VControl) {
  const { left, top, height, width } = control;
  return { left, top, height, width };
}

export default Control;
