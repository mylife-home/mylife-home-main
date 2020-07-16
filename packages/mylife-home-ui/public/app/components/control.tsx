import React, { FunctionComponent, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppState } from '../store/types';
import { VControl } from '../store/types/model';
import { actionPrimary, actionSecondary } from '../store/actions/actions';
import { useInputActions } from '../behaviors/input-actions';

type ControlProps = {
  windowId: string;
  controlId: string;
  control: VControl;
};

const Control: FunctionComponent<ControlProps> = ({ windowId, controlId, control }) => {
  const { onActionPrimary, onActionSecondary } = useConnect(windowId, controlId);
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

function getStyleSizePosition(control: VControl) {
  const { left, top, height, width } = control;
  return { left, top, height, width };
}

function useConnect(windowId: string, componentId: string) {
  const dispatch = useDispatch();
  return {
    ...useSelector((state: AppState) => ({
      // TODO: fetch control state
    })),
    ...useMemo(() => ({
      onActionPrimary: () => dispatch(actionPrimary(windowId, componentId)),
      onActionSecondary: () => dispatch(actionSecondary(windowId, componentId))
    }), [dispatch])
  };
};
