'use strict';

import React from 'react';
import * as mui from 'material-ui';

import DataImage from './data-image';

class ImageSelector extends React.Component {

  constructor(props, context) {
    super(props, context);

    this.state = {
      open: false
    };
  }

  handleTouchTap(event) {
    event.stopPropagation();
    this.setState({
      open: true,
      anchorEl: event.currentTarget
    });
  }

  handleRequestClose() {
    this.setState({ open: false });
  }

  handleSelect(img) {
    const { onImageChange } = this.props;

    this.handleRequestClose();

    onImageChange(img.uid);
  }

  render() {
    const { sortedImages, selectedImage } = this.props;

    return (
      <div>
        <mui.RaisedButton
          label={selectedImage ? selectedImage.id : '<none>'}
          icon={<DataImage image={selectedImage} width={20} height={20} />}
          onTouchTap={(event) => this.handleTouchTap(event)}
        />
        <mui.Popover
          open={this.state.open}
          anchorEl={this.state.anchorEl}
          anchorOrigin={{horizontal: 'left', vertical: 'bottom'}}
          targetOrigin={{horizontal: 'left', vertical: 'top'}}
          onRequestClose={this.handleRequestClose.bind(this)}
        >
          <mui.Menu>
            {sortedImages.map(img => (
              <mui.MenuItem
                key={img.uid}
                primaryText={img.id}
                icon={<DataImage image={img} width={20} height={20} />}
                onTouchTap={this.handleSelect.bind(this, img)}/>
            ))}
          </mui.Menu>
        </mui.Popover>
      </div>
    );
  }
}

ImageSelector.propTypes = {
  sortedImages  : React.PropTypes.array.isRequired,
  selectedImage : React.PropTypes.object,
  onImageChange : React.PropTypes.func.isRequired
};

export default ImageSelector;