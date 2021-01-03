'use strict';

import React from 'react';
import * as mui from 'material-ui';
import { sortBy } from '../../utils/index';

class PropertiesControlAction extends React.Component {

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

  handleSelectWindow(window, popup) {
    const { onActionChange } = this.props;

    this.handleRequestClose();

    onActionChange({
      component: null,
      window: {
        window: window.uid,
        popup
      }
    });
  }

  handleSelectComponent(component, action) {
    const { onActionChange } = this.props;

    this.handleRequestClose();

    onActionChange({
      window: null,
      component: {
        component: component.uid,
        action
      }
    });
  }

  handleSelectNone() {
    const { onActionChange } = this.props;

    this.handleRequestClose();

    onActionChange(null);
  }

  render() {
    const {
      sortedWindows,
      sortedComponents,
      action,
      selectedWindow,
      selectedComponent
    } = this.props;

    let display = '<none>';
    if(action) {
      const actionComponent = action.component;
      if(actionComponent) {
        display = `${selectedComponent.id}.${actionComponent.action}`;
      }
      const actionWindow = action.window;
      if(actionWindow) {
        display = `${selectedWindow.id} (${actionWindow.popup ? 'popup' : 'change'})`;
      }
    }

    return (
      <div>
        <mui.RaisedButton
          label={display}
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
            <mui.MenuItem primaryText={'Component'} menuItems={sortedComponents.
              filter(c => c.plugin.clazz.actions.filter(a => !a.types.length).length).
              map(comp => (
              <mui.MenuItem
                key={comp.id}
                primaryText={comp.id}
                menuItems={sortBy(comp.plugin.clazz.actions.
                  filter(a => !a.types.length), 'name').
                  map(action => (
                  <mui.MenuItem
                    key={action.name}
                    primaryText={action.name}
                    onTouchTap={() => this.handleSelectComponent(comp, action.name)} />
                  ))}
                />
              ))}
            />
            <mui.MenuItem primaryText={'Window (change)'} menuItems={sortedWindows.map(wnd => (
              <mui.MenuItem
                key={wnd.uid}
                primaryText={wnd.id}
                onTouchTap={() => this.handleSelectWindow(wnd, false)}/>
              ))}
            />
            <mui.MenuItem primaryText={'Window (popup)'} menuItems={sortedWindows.map(wnd => (
              <mui.MenuItem
                key={wnd.uid}
                primaryText={wnd.id}
                onTouchTap={() => this.handleSelectWindow(wnd, true)}/>
              ))}
            />
            <mui.MenuItem primaryText={'<none>'} onTouchTap={() => this.handleSelectNone()} />
          </mui.Menu>
        </mui.Popover>
      </div>
    );
  }
}

PropertiesControlAction.propTypes = {
  sortedWindows     : React.PropTypes.array.isRequired,
  sortedComponents  : React.PropTypes.array.isRequired,
  action            : React.PropTypes.object,
  selectedWindow    : React.PropTypes.object,
  selectedComponent : React.PropTypes.object,
  onActionChange    : React.PropTypes.func.isRequired
};

export default PropertiesControlAction;