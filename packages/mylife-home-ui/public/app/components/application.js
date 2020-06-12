'use strict';

import React from 'react';

const Application = ({ children }) => (
  <div>
    { children }
  </div>
);

Application.propTypes = {
  children: React.PropTypes.oneOfType([
    React.PropTypes.arrayOf(React.PropTypes.node),
    React.PropTypes.node
  ])
};

export default Application;
