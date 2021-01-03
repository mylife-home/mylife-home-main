'use strict';

import React from 'react';
import * as mui from 'material-ui';

import { newId } from '../../utils/index';

import PropertiesControlTextContextRow from './properties-control-text-context-row';

class PropertiesControlTextContext extends React.Component {

  constructor(props, context) {
    super(props, context);

    this.state = {
      open: false,
      newItem: this.createNewItem()
    };
  }

  createNewItem() {
    return {
      uid       : newId(),
      id        : null,
      component : null,
      attribute : null
    };
  }

  handleTouchTap(event) {
    event.stopPropagation();
    this.setState({
      open: true
    });
  }

  handleClose() {
    this.setState({ open: false });
  }

  handleCreate() {
    const { onNew } = this.props;
    const newItem = this.state.newItem;

    if(!newItem.component || !newItem.attribute) {
      return;
    }

    onNew(newItem);
    this.setState({ newItem: this.createNewItem() });
  }

  render() {
    const { project, control, components, onIdChange, onComponentChange, onDelete } = this.props;

    const context = control.text.context;
    const display = context.toArray().map(item => `${item.id} => ${components.get(item.component).id}.${item.attribute}`).join('\n') || '<none>';

    return (
      <div>
        <mui.RaisedButton
          label={display}
          onTouchTap={(event) => this.handleTouchTap(event)}
        />

        <mui.Dialog
          title="Select control text context"
          actions={<mui.FlatButton
                    label="OK"
                    onTouchTap={this.handleClose.bind(this)} />}
          modal={true}
          open={this.state.open}
          autoScrollBodyContent={true}>
          <mui.Table selectable={false}>
            <mui.TableHeader displaySelectAll={false}>
              <mui.TableRow>
                <mui.TableHeaderColumn>ID</mui.TableHeaderColumn>
                <mui.TableHeaderColumn>Component - Action</mui.TableHeaderColumn>
                <mui.TableHeaderColumn></mui.TableHeaderColumn>
              </mui.TableRow>
            </mui.TableHeader>
            <mui.TableBody>
              {context.toArray().map(it => (
                <PropertiesControlTextContextRow
                  key={it.uid}
                  project={project}
                  item={it}
                  isNew={false}
                  action={() => onDelete(it)}
                  onIdChange={(id) => onIdChange(it, id)}
                  onComponentChange={(component, attribute) => onComponentChange(it, component, attribute)}
                />
              ))}
              <PropertiesControlTextContextRow
                key={this.state.newItem.uid}
                project={project}
                item={this.state.newItem}
                isNew={true}
                action={this.handleCreate.bind(this)}
                onIdChange={(id) => this.setState({ newItem: { ...this.state.newItem, id } })}
                onComponentChange={(component, attribute) => this.setState({ newItem: { ...this.state.newItem, component, attribute } })}
              />
            </mui.TableBody>
          </mui.Table>
        </mui.Dialog>
      </div>
    );
  }
}

PropertiesControlTextContext.propTypes = {
  project           : React.PropTypes.number.isRequired,
  control           : React.PropTypes.object.isRequired,
  components        : React.PropTypes.object.isRequired,
  onNew             : React.PropTypes.func.isRequired,
  onDelete          : React.PropTypes.func.isRequired,
  onIdChange        : React.PropTypes.func.isRequired,
  onComponentChange : React.PropTypes.func.isRequired
};

export default PropertiesControlTextContext;
