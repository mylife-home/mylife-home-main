'use strict';

import React from 'react';
import * as mui from 'material-ui';

import ToolboxControlContainer from '../../containers/ui-project-tab/toolbox-control-container';

const Toolbox = ({ project }) => (
  <mui.List>
    <mui.ListItem key={'text'}>
      <ToolboxControlContainer project={project} type={'text'}></ToolboxControlContainer>
    </mui.ListItem>
    <mui.ListItem key={'image'}>
      <ToolboxControlContainer project={project} type={'image'}></ToolboxControlContainer>
    </mui.ListItem>
  </mui.List>
);

Toolbox.propTypes = {
  project: React.PropTypes.object.isRequired,
};

export default Toolbox;
