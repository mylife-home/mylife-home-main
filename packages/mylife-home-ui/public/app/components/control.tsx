import React, { FunctionComponent, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppState } from '../store/types';
import { UIControl, makeGetUIControl } from '../store/selectors/control';
import { actionPrimary, actionSecondary } from '../store/actions/actions';
import { useInputActions } from '../behaviors/input-actions';

type ControlProps = {
  windowId: string;
  controlId: string;
};

const Control: FunctionComponent<ControlProps> = ({ windowId, controlId }) => {
  const { control, onActionPrimary, onActionSecondary } = useConnect(windowId, controlId);
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
      {control.displayResource && <img src={`/resources/${control.displayResource}`} />}
      {control.text && <p>{control.text}</p>}
    </div>
  )
};

export default Control;

function getStyleSizePosition(control: UIControl) {
  const { left, top, height, width } = control;
  return { left, top, height, width };
}

function useConnect(windowId: string, controlId: string) {
  const dispatch = useDispatch();
  const getUIControl = useMemo(() => makeGetUIControl(windowId, controlId), [windowId, controlId]);
  return {
    ...useSelector((state: AppState) => ({
      control: getUIControl(state)
    })),
    ...useMemo(() => ({
      onActionPrimary: () => dispatch(actionPrimary(windowId, controlId)),
      onActionSecondary: () => dispatch(actionSecondary(windowId, controlId))
    }), [dispatch, windowId, controlId])
  };
};
