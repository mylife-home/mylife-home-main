'use strict';

import React from 'react';

import PropertiesProjectContainer from '../../containers/ui-project-tab/properties-project-container';
import PropertiesComponentContainer from '../../containers/ui-project-tab/properties-component-container';
import PropertiesImageContainer from '../../containers/ui-project-tab/properties-image-container';
import PropertiesWindowContainer from '../../containers/ui-project-tab/properties-window-container';
import PropertiesControlContainer from '../../containers/ui-project-tab/properties-control-container';

const Properties = ({ project, selection }) => {

  switch(selection && selection.type) {
    case 'component':
      return (<PropertiesComponentContainer project={project} component={selection.uid} />);

    case 'image':
      return (<PropertiesImageContainer project={project} image={selection.uid} />);

    case 'window':
      return (<PropertiesWindowContainer project={project} window={selection.uid} />);

    case 'control':
      return (<PropertiesControlContainer project={project} window={selection.windowUid} control={selection.controlUid} />);
  }

  return (<PropertiesProjectContainer project={project} />);
};

Properties.propTypes = {
  project: React.PropTypes.number.isRequired,
  selection: React.PropTypes.object
};

export default Properties;
