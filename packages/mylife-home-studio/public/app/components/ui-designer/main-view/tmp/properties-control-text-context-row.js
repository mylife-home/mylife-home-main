'use strict';

import React from 'react';
import * as mui from 'material-ui';
import icons from '../icons';

import ComponentAttributeSelectorContainer from '../../containers/ui-project-tab/component-attribute-selector-container';

class PropertiesControlTextContextRow extends React.Component {

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

  handleSelectComponent(component, attribute) {
    const { onComponentChange } = this.props;

    this.handleRequestClose();

    onComponentChange(component, attribute);
  }

  handleIdChange(event) {
    event.stopPropagation();
    const { onIdChange } = this.props;

    onIdChange(event.target.value);
  }

  render() {
    const { project, item, isNew, action } = this.props;

    return (
      <mui.TableRow>
        <mui.TableRowColumn>
          <mui.TextField
            id={`${item.uid}_id`}
            value={item.id || ''}
            onChange={(event) => this.handleIdChange(event)} />
        </mui.TableRowColumn>
        <mui.TableRowColumn>
         <ComponentAttributeSelectorContainer
          project={project}
          component={item.component}
          attribute={item.attribute}
          onChange={(comp, attr) => this.handleSelectComponent(comp, attr)} />
        </mui.TableRowColumn>
        <mui.TableRowColumn>
          <mui.IconButton onTouchTap={action}>
            {isNew ? (
              <icons.actions.New/>
            ) : (
              <icons.actions.Close/>
            )}
          </mui.IconButton>
        </mui.TableRowColumn>
      </mui.TableRow>
    );
  }
}

PropertiesControlTextContextRow.propTypes = {
  project           : React.PropTypes.number.isRequired,
  item              : React.PropTypes.object.isRequired,
  isNew             : React.PropTypes.bool.isRequired,
  action            : React.PropTypes.func.isRequired,
  onIdChange        : React.PropTypes.func.isRequired,
  onComponentChange : React.PropTypes.func.isRequired
};

export default PropertiesControlTextContextRow;