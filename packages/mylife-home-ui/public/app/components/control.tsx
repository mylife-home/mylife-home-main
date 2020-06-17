import React from 'react';
import InputManager from '../utils/input-manager';
import { VControl } from '../store/types/windows';

type ControlProps = {
  control           : VControl
  onActionPrimary   : () => void,
  onActionSecondary : () => void,

}

function getStyleSizePosition(control: VControl) {
  const { left, top, height, width } = control;
  return { left, top, height, width };
}

class Control extends React.PureComponent<ControlProps> {
  private readonly inputManager = new InputManager();

  constructor(props: ControlProps) {
    super(props);

    this.configureInputManager(props);
  }

  componentWillReceiveProps(nextProps: ControlProps) {
    this.configureInputManager(nextProps);
  }

  configureInputManager(props: ControlProps) {
    const { onActionPrimary, onActionSecondary } = props;
    this.inputManager.config = {
      s  : onActionPrimary,
      l  : onActionSecondary,
      ss : onActionSecondary
    };
  }

  render() {
    const { control } = this.props;
    let e: React.TouchEvent;
    let e2: React.MouseEvent;

    return (
      <div title={control.id}
           style={getStyleSizePosition(control)}
           className={control.active ? 'mylife-control-button' : 'mylife-control-inactive'}
           onTouchStart={(e) => { e.preventDefault(); this.inputManager.down(); }}
           onTouchEnd={(e) => { e.preventDefault(); this.inputManager.up(); }}
           onMouseDown={(e) => { e.preventDefault(); this.inputManager.down(); }}
           onMouseUp={(e) => { e.preventDefault(); this.inputManager.up(); }}>
        {control.display && <img src={`data:image/png;base64,${control.display}`} />}
        {control.text && <p>{control.text}</p>}
      </div>
    );
  }
}

export default Control;
