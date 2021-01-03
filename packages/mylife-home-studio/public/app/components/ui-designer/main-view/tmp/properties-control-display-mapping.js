'use strict';

import React from 'react';
import * as mui from 'material-ui';

import { newId } from '../../utils/index';

import PropertiesControlDisplayMappingRow from './properties-control-display-mapping-row';

class PropertiesControlDisplayMapping extends React.Component {

  constructor(props, context) {
    super(props, context);

    this.state = {
      open: false,
      newItem: this.createNewItem()
    };
  }

  createNewItem() {
    return {
      uid      : newId(),
      max      : null,
      min      : null,
      resource : null,
      value    : null
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
    const { control, onNew, component } = this.props;

    const componentAttribute = component.plugin.clazz.attributes.find(a => a.name === control.display.attribute);
    const isRange = componentAttribute.type.type() === 'Range';

    const { newItem } = this.state;

    if(!newItem.resource) {
      return;
    }
    if(!isRange && !newItem.value) {
      return;
    }

    onNew(newItem);
    this.setState({ newItem: this.createNewItem() });
  }

  render() {
    const {
      project, control, component, images,
      onDelete, onImageChange, onValueChange, onMinChange, onMaxChange
    } = this.props;

    const mapping = control.display.map;
    if(!control.display.component || !control.display.attribute) {
      return (<div>Select component/attribute</div>);
    }

    const attributeType = component.plugin.clazz.attributes.find(a => a.name === control.display.attribute).type;
    const isRange = attributeType.type() === 'Range';
    const mappingDisplay = mapping.toArray().map(item => {
      const key = isRange ? `[${item.min}-${item.max}]` : item.value;
      return `${key} => ${images.get(item.resource).id}`;
    }).join('\n') || '<none>';

    return (
      <div>
        <mui.RaisedButton
          label={mappingDisplay}
          onTouchTap={(event) => this.handleTouchTap(event)}
        />

        <mui.Dialog
          title="Select control display mapping"
          actions={<mui.FlatButton
                    label="OK"
                    onTouchTap={this.handleClose.bind(this)} />}
          modal={true}
          open={this.state.open}
          autoScrollBodyContent={true}>
          <mui.Table selectable={false}>
            <mui.TableHeader displaySelectAll={false}>
              {isRange ? (
                <mui.TableRow>
                  <mui.TableHeaderColumn>Min</mui.TableHeaderColumn>
                  <mui.TableHeaderColumn>Max</mui.TableHeaderColumn>
                  <mui.TableHeaderColumn>Image</mui.TableHeaderColumn>
                  <mui.TableHeaderColumn></mui.TableHeaderColumn>
                </mui.TableRow>
              ) : (
                <mui.TableRow>
                  <mui.TableHeaderColumn>Value</mui.TableHeaderColumn>
                  <mui.TableHeaderColumn>Image</mui.TableHeaderColumn>
                  <mui.TableHeaderColumn></mui.TableHeaderColumn>
                </mui.TableRow>
              )}
            </mui.TableHeader>
            <mui.TableBody>
              {mapping.toArray().map(it => (
                <PropertiesControlDisplayMappingRow
                  key={it.uid}
                  project={project}
                  item={it}
                  attributeType={attributeType}
                  isNew={false}
                  action={() => onDelete(it)}
                  onImageChange={(img) => onImageChange(it, img)}
                  onValueChange={(value) => onValueChange(it, value)}
                  onMinChange={(value) => onMinChange(it, value)}
                  onMaxChange={(value) => onMaxChange(it, value)}
                />
              ))}
              <PropertiesControlDisplayMappingRow
                key={this.state.newItem.uid}
                project={project}
                item={this.state.newItem}
                attributeType={attributeType}
                isNew={true}
                action={this.handleCreate.bind(this)}
                onImageChange={(resource) => this.setState({ newItem: { ...this.state.newItem, resource } })}
                onValueChange={(value) => this.setState({ newItem: { ...this.state.newItem, value } })}
                onMinChange={(min) => this.setState({ newItem: { ...this.state.newItem, min } })}
                onMaxChange={(max) => this.setState({ newItem: { ...this.state.newItem, max } })}
              />
            </mui.TableBody>
          </mui.Table>
        </mui.Dialog>
      </div>
    );
  }
}

PropertiesControlDisplayMapping.propTypes = {
  project       : React.PropTypes.number.isRequired,
  control       : React.PropTypes.object.isRequired,
  component     : React.PropTypes.object,
  images        : React.PropTypes.object.isRequired,
  onNew         : React.PropTypes.func.isRequired,
  onDelete      : React.PropTypes.func.isRequired,
  onImageChange : React.PropTypes.func.isRequired,
  onValueChange : React.PropTypes.func.isRequired,
  onMinChange   : React.PropTypes.func.isRequired,
  onMaxChange   : React.PropTypes.func.isRequired
};

export default PropertiesControlDisplayMapping;
