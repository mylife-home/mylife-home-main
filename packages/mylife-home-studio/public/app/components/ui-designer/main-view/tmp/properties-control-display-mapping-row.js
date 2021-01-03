'use strict';

import React from 'react';
import * as mui from 'material-ui';
import icons from '../icons';

import ImageSelectorContainer from '../../containers/ui-project-tab/image-selector-container';
import PropertiesEnumValueSelector from './properties-enum-value-selector';

class PropertiesControlDisplayMappingRow extends React.Component {

  constructor(props, context) {
    super(props, context);

    this.state = {
      open: false
    };
  }

  handleTouchTap(event) {
    this.setState({
      open: true,
      anchorEl: event.currentTarget
    });
  }

  handleRequestClose() {
    this.setState({ open: false });
  }

  handleValueChange(value) {
    const { onValueChange } = this.props;
    onValueChange(value);
  }

  handleMinChange(event) {
    event.stopPropagation();

    const value = parseInt(event.target.value, 10);
    if(isNaN(value)) { return; }

    const { onMinChange } = this.props;
    onMinChange(value);
  }

  handleMaxChange(event) {
    event.stopPropagation();

    const value = parseInt(event.target.value, 10);
    if(isNaN(value)) { return; }

    const { onMaxChange } = this.props;
    onMaxChange(value);
  }

  render() {
    const { project, item, attributeType, isNew, action, onImageChange } = this.props;
    const isRange = attributeType.type() === 'Range';

    const imageRowColumn = (
      <mui.TableRowColumn>
       <ImageSelectorContainer
        project={project}
        image={item.resource}
        onImageChange={ onImageChange } />
      </mui.TableRowColumn>
    );

    const actionRowColumn = (
      <mui.TableRowColumn>
        <mui.IconButton onTouchTap={action}>
          {isNew ? (
            <icons.actions.New/>
          ) : (
            <icons.actions.Close/>
          )}
        </mui.IconButton>
      </mui.TableRowColumn>
    );

    return isRange ? (
      <mui.TableRow>
        <mui.TableRowColumn>
          <mui.TextField
            id={`${item.uid}_min`}
            value={item.min || 0}
            onChange={(event) => this.handleMinChange(event)}
            type='number' />
        </mui.TableRowColumn>
        <mui.TableRowColumn>
          <mui.TextField
            id={`${item.uid}_max`}
            value={item.max || 0}
            onChange={(event) => this.handleMaxChange(event)}
            type='number' />
        </mui.TableRowColumn>
        {imageRowColumn}
        {actionRowColumn}
      </mui.TableRow>
    ) : (
      <mui.TableRow>
        <mui.TableRowColumn>
          <PropertiesEnumValueSelector
            values={attributeType.values}
            value={item.value}
            onChange={(value) => this.handleValueChange(value)} />
        </mui.TableRowColumn>
        {imageRowColumn}
        {actionRowColumn}
      </mui.TableRow>
    );
  }
}

PropertiesControlDisplayMappingRow.propTypes = {
  project       : React.PropTypes.number.isRequired,
  item          : React.PropTypes.object.isRequired,
  attributeType : React.PropTypes.object.isRequired,
  isNew         : React.PropTypes.bool.isRequired,
  action        : React.PropTypes.func.isRequired,
  onImageChange : React.PropTypes.func.isRequired,
  onMinChange   : React.PropTypes.func.isRequired,
  onMaxChange   : React.PropTypes.func.isRequired,
  onValueChange : React.PropTypes.func.isRequired
};

export default PropertiesControlDisplayMappingRow;