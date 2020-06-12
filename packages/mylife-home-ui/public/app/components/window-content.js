'use strict';

import React from 'react';

import Control from './control';

function getStyleSize(window) {
  const { height, width } = window;
  return { height, width };
}

const WindowContent = ({ window, onActionPrimary, onActionSecondary }) => (
  <div style={getStyleSize(window)} className="mylife-window-container">
    <img src={window.resource && `data:image/png;base64,${window.resource}`} />
    {window.controls.map(control => (<Control key={control.id}
                                              control={control}
                                              onActionPrimary={() => onActionPrimary(window.id, control.id)}
                                              onActionSecondary={() => onActionSecondary(window.id, control.id)}/>))}
  </div>
);

WindowContent.propTypes = {
  window            : React.PropTypes.object.isRequired,
  onActionPrimary   : React.PropTypes.func.isRequired,
  onActionSecondary : React.PropTypes.func.isRequired,
};

export default WindowContent;
