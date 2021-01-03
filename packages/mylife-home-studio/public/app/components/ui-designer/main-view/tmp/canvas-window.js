'use strict';

import React from 'react';
import muiThemeable from 'material-ui/styles/muiThemeable';
import * as dnd from 'react-dnd';
import ResizableBox from 'react-resizable-box';
import { debounce } from 'throttle-debounce';
import commonStyles from './canvas-styles';
import { stopPropagationWrapper } from '../../utils/index';

import DataImage from './data-image';
import CanvasControlContainer from '../../containers/ui-project-tab/canvas-control-container';

import { dragTypes } from '../../constants/index';

function getStyles(props) {
  const { muiTheme, isSelected } = props;

  const backColor = (isSelected ? muiTheme.palette.primary1Color : muiTheme.palette.primary3Color);

  return Object.assign({
    windowContainer: {
      margin: '10px'
    },
    window: {
      height: '100%',
      border: '1px solid ' + backColor,
      position: 'relative'
    },
    background: {
      height: '100%',
      width: '100%'
    }
  }, commonStyles);
}

class CanvasWindow extends React.Component {

  constructor(props) {
    super(props);
    const { onResized } = this.props;
    this.debouncedResized = debounce(100, onResized);
  }

  render() {
    const { project, window, background, controls, onSelected, connectDropTarget } = this.props;
    const styles = getStyles(this.props);

    return connectDropTarget(
      <div style={styles.container}
           onClick={stopPropagationWrapper(onSelected)}>
        <div style={styles.windowContainer}>
          <ResizableBox width={window.width}
                        height={window.height}
                        onResize={this.debouncedResized}
                        isResizable={{ right: true, bottom: true, bottomRight: true }}>
            <div ref="canvas"
                 style={styles.window}>
              <DataImage image={background} style={styles.background}/>
              {controls.map((ctrl) => (
                <CanvasControlContainer key={ctrl.uid} project={project} window={window} control={ctrl} />))}
            </div>
          </ResizableBox>
        </div>
      </div>
    );
  }
}

CanvasWindow.propTypes = {
  project           : React.PropTypes.number.isRequired,
  window            : React.PropTypes.object.isRequired,
  background        : React.PropTypes.object,
  controls          : React.PropTypes.arrayOf(React.PropTypes.object.isRequired).isRequired,
  onSelected        : React.PropTypes.func.isRequired,
  onResized         : React.PropTypes.func.isRequired,
  connectDropTarget : React.PropTypes.func.isRequired,
};

const canvasTarget = {
  drop(props, monitor, component) {
    switch(monitor.getItemType()) {
      case dragTypes.UI_TOOLBOX_CONTROL: {
        const canvasRect = component.refs.canvas.getBoundingClientRect();
        const dropOffset = monitor.getClientOffset();
        const location = { x: dropOffset.x - canvasRect.left, y: dropOffset.y - canvasRect.top };
        // handled in ToolboxControl/endDrag
        return { location };
      }

      case dragTypes.UI_CONTROL: {
        // handled in CanvasControl/endDrag
        return { delta: monitor.getDifferenceFromInitialOffset() };
      }
    }
  }
};

function collect(connect) {
  return {
    connectDropTarget: connect.dropTarget()
  };
}

export default muiThemeable()(dnd.DropTarget([dragTypes.UI_TOOLBOX_CONTROL, dragTypes.UI_CONTROL], canvasTarget, collect)(CanvasWindow));
