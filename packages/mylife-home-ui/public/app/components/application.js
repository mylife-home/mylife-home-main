'use strict';

import React from 'react';
import PropTypes from 'prop-types';

const Application = ({ children }) => (
  <div>
    { children }
  </div>
);

Application.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node
  ])
};

export default Application;
