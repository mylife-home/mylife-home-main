'use strict';

import React from 'react';
import muiThemeable from 'material-ui/styles/muiThemeable';
import * as dnd from 'react-dnd';
import ResizableBox from 'react-resizable-box';
import { debounce } from 'throttle-debounce';

import { stopPropagationWrapper } from '../../utils/index';

import DataImage from './data-image';

import { dragTypes } from '../../constants/index';

function getStyles(props) {
  const { window, control, isSelected, muiTheme } = props;

  const backColor = (isSelected ? muiTheme.palette.primary1Color : muiTheme.palette.primary3Color);
  const left = (window.width * control.x) - (control.width / 2);
  const top = (window.height * control.y) - (control.height / 2);

  return Object.assign({
    controlContainer: {
      position : 'absolute',
      left,
      top
    },
    control: {
      height: '100%',
      border: '1px solid ' + backColor,
      position: 'relative'
    },
    moveHandle: {
      backgroundColor: backColor,
      position: 'absolute',
      width: '15px',
      height: '15px',
      display: 'inline-block',
      top: '10px',
      left: '10px',
      cursor: 'move'
    },
    item: {
      height: '100%',
      width: '100%'
    }
  });
}

class CanvasControl extends React.Component {

  constructor(props) {
    super(props);
    const { onResized } = this.props;
    this.debouncedResized = debounce(100, onResized);
  }

  render() {
    const { control, displayImage, onSelected, connectDragSource, connectDragPreview, isDragging } = this.props;
    const styles = getStyles(this.props);

    if(isDragging) {
      return null;
    }

    return (
      <div style={styles.controlContainer}
           onClick={stopPropagationWrapper(onSelected)}>
        <ResizableBox width={control.width}
                      height={control.height}
                      onResize={this.debouncedResized}
                      isResizable={{ right: true, bottom: true, bottomRight: true }}>
          {connectDragPreview(
            <div style={styles.control}>
              {control.text ?
                (<div style={Object.assign({ overflow: 'hidden' }, styles.item)}>
                  {control.text.format}
                 </div>)
              : (<DataImage image={displayImage} style={styles.item}/>)}
              {connectDragSource(<div style={styles.moveHandle}/>)}
            </div>
          )}
        </ResizableBox>
      </div>
    );
  }
}

CanvasControl.propTypes = {
  project            : React.PropTypes.number.isRequired,
  window             : React.PropTypes.object.isRequired,
  control            : React.PropTypes.object.isRequired,
  displayImage       : React.PropTypes.object,
  onSelected         : React.PropTypes.func.isRequired,
  onResized          : React.PropTypes.func.isRequired,
  onMove             : React.PropTypes.func.isRequired,
  connectDragSource  : React.PropTypes.func.isRequired,
  connectDragPreview : React.PropTypes.func.isRequired,
  isDragging         : React.PropTypes.bool.isRequired
};

const controlSource = {
  beginDrag(props) {
    props.onSelected();
    return {};
  },

  endDrag(props, monitor) {
    if(!monitor.didDrop()) { return; }

    const { window, control, onMove } = props;

    const { delta } = monitor.getDropResult();
    onMove({
      x: control.x + delta.x / window.width,
      y: control.y + delta.y / window.height
    });
  }
};

function collect(connect, monitor) {
  return {
    connectDragSource: connect.dragSource(),
    connectDragPreview: connect.dragPreview(),
    isDragging: monitor.isDragging()
  };
}

export default muiThemeable()(dnd.DragSource(dragTypes.UI_CONTROL, controlSource, collect)(CanvasControl));
