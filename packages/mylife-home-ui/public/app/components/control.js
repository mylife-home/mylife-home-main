'use strict';

import React from 'react';

import InputManager from '../utils/input-manager';

function getStyleSizePosition(control) {
  const { left, top, height, width } = control;
  return { left, top, height, width };
}

class Control extends React.PureComponent {

  constructor(props) {
    super(props);

    this.inputManager = new InputManager();
    this.configureInputManager(props);
  }

  componentWillReceiveProps(nextProps) {
    this.configureInputManager(nextProps);
  }

  configureInputManager(props) {
    const { onActionPrimary, onActionSecondary } = props;
    this.inputManager.config = {
      s  : onActionPrimary,
      l  : onActionSecondary,
      ss : onActionSecondary
    };
  }

  render() {
    const { control } = this.props;

    return (
      <div title={control.id}
           style={getStyleSizePosition(control)}
           className={control.active ? 'mylife-control-button' : 'mylife-control-inactive'}
           onTouchStart={(e) => this.inputManager.down(e)}
           onTouchEnd={(e) => this.inputManager.up(e)}
           onMouseDown={(e) => this.inputManager.down(e)}
           onMouseUp={(e) => this.inputManager.up(e)}>
        {control.display && <img src={`data:image/png;base64,${control.display}`} />}
        {control.text && <p>{control.text}</p>}
      </div>
    );
  }
}

Control.propTypes = {
  control           : React.PropTypes.object.isRequired,
  onActionPrimary   : React.PropTypes.func.isRequired,
  onActionSecondary : React.PropTypes.func.isRequired,
};

export default Control;
