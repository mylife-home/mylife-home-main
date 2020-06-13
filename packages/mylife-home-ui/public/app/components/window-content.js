'use strict';

import React from 'react';
import PropTypes from 'prop-types';

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
  window            : PropTypes.object.isRequired,
  onActionPrimary   : PropTypes.func.isRequired,
  onActionSecondary : PropTypes.func.isRequired,
};

export default WindowContent;
