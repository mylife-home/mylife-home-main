'use strict';

import React from 'react';

import CanvasComponentContainer from '../../containers/ui-project-tab/canvas-component-container';
import CanvasImageContainer from '../../containers/ui-project-tab/canvas-image-container';
import CanvasWindowContainer from '../../containers/ui-project-tab/canvas-window-container';
import CanvasProjectContainer from '../../containers/ui-project-tab/canvas-project-container';

const Canvas = ({ project, activeContent }) => {

  switch(activeContent && activeContent.type) {
    case 'component': {
      return (<CanvasComponentContainer project={project} component={activeContent.uid} />);
    }

    case 'image': {
      return (<CanvasImageContainer project={project} image={activeContent.uid} />);
    }

    case 'window': {
      return (<CanvasWindowContainer project={project} window={activeContent.uid} />);
    }
  }

  return (<CanvasProjectContainer project={project} />);
};

Canvas.propTypes = {
  project       : React.PropTypes.number.isRequired,
  activeContent : React.PropTypes.object
};

export default Canvas;