'use strict';

import React from 'react';
import * as dnd from 'react-dnd';
import base from '../base/index';
import icons from '../icons';

import { dragTypes } from '../../constants/index';

const styles = {
  iconContainer: {
    float  : 'left',
    width  : '32px',
    height : '32px'
  },
  icon: {
    textAlign     : 'center',
    height        : '32px',
    lineHeight    : '32px',
    verticalAlign : 'middle'
  },
  textContainer: {
    lineHeight : '32px',
    margin     : '0px',
    marginLeft : '40px'
  }
};

function renderIcon(connectDragPreview, type) {

  switch(type) {
    case 'text':
      return (
        <base.TooltipContainer tooltip="Text" tooltipPosition="bottom-right">
          {connectDragPreview(
            <div style={styles.iconContainer}>
              <icons.UiText style={styles.icon} />
            </div>
          )}
        </base.TooltipContainer>
      );

    case 'image':
      return (
        <base.TooltipContainer tooltip="Image" tooltipPosition="bottom-right">
          {connectDragPreview(
            <div style={styles.iconContainer}>
              <icons.UiImage style={styles.icon} />
            </div>
          )}
        </base.TooltipContainer>
      );

    default:
      return null;
  }
}

function renderText(type) {

  switch(type) {
    case 'text':
      return 'Text control';

    case 'image':
      return 'Image control';

    default:
      return null;
  }
}

const ToolboxControl = ({ connectDragSource, isDragging, connectDragPreview, type }) => connectDragSource(
  <div style={{
    opacity: isDragging ? 0.5 : 1,
    cursor: 'move'
  }}>
    {renderIcon(connectDragPreview, type)}
    <div style={styles.textContainer}>{renderText(type)}</div>
  </div>
);

ToolboxControl.propTypes = {
  project: React.PropTypes.object.isRequired,
  type: React.PropTypes.string.isRequired,
  onNewControl: React.PropTypes.func.isRequired,
  connectDragSource: React.PropTypes.func.isRequired,
  connectDragPreview: React.PropTypes.func.isRequired,
  isDragging: React.PropTypes.bool.isRequired
};

const pluginSource = {
  beginDrag(props) {
    return {
      type: props.type
    };
  },

  endDrag(props, monitor) {
    if(!monitor.didDrop()) { return; }

    const { project, type, onNewControl } = props;
    const { location } = monitor.getDropResult();
    onNewControl(project.uid, location, type);
  }
};

function collect(connect, monitor) {
  return {
    connectDragSource: connect.dragSource(),
    connectDragPreview: connect.dragPreview(),
    isDragging: monitor.isDragging()
  };
}

export default dnd.DragSource(dragTypes.UI_TOOLBOX_CONTROL, pluginSource, collect)(ToolboxControl);

