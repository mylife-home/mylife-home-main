'use strict';

import React from 'react';

import PropertiesLabel from '../properties/properties-label';

import ImageSelectorContainer from '../../containers/ui-project-tab/image-selector-container';
import PropertiesControlDisplayMapping from './properties-control-display-mapping';
import ComponentAttributeSelectorContainer from '../../containers/ui-project-tab/component-attribute-selector-container';

const PropertiesControlDisplay = ({
  project, control, images, component,
  onImageChange, onComponentChange, onMappingNew, onMappingDelete, onMappingImageChange, onMappingValueChange, onMappingMinChange, onMappingMaxChange
}) => (
  <tbody>
    <tr key="Default image">
      <td><PropertiesLabel text={'Default image'} /></td>
      <td><ImageSelectorContainer project={project} image={control.display.defaultResource} onImageChange={onImageChange} /></td>
    </tr>
    <tr key="Component/Attribute">
      <td><PropertiesLabel text={'Component/Attribute'} /></td>
      <td><ComponentAttributeSelectorContainer
        project={project}
        component={control.display.component}
        attribute={control.display.attribute}
        nullable={true}
        onChange={onComponentChange} />
      </td>
    </tr>
    <tr key="Mapping">
      <td><PropertiesLabel text={'Mapping'} /></td>
      <td>
        <PropertiesControlDisplayMapping project={project}
                                         control={control}
                                         component={component}
                                         images={images}
                                         onNew={onMappingNew}
                                         onDelete={onMappingDelete}
                                         onImageChange={onMappingImageChange}
                                         onValueChange={onMappingValueChange}
                                         onMinChange={onMappingMinChange}
                                         onMaxChange={onMappingMaxChange} />
      </td>
    </tr>
  </tbody>
);

PropertiesControlDisplay.propTypes = {
  project              : React.PropTypes.number.isRequired,
  control              : React.PropTypes.object.isRequired,
  images               : React.PropTypes.object.isRequired,
  component            : React.PropTypes.object,
  onImageChange        : React.PropTypes.func.isRequired,
  onComponentChange    : React.PropTypes.func.isRequired,
  onMappingNew         : React.PropTypes.func.isRequired,
  onMappingDelete      : React.PropTypes.func.isRequired,
  onMappingImageChange : React.PropTypes.func.isRequired,
  onMappingValueChange : React.PropTypes.func.isRequired,
  onMappingMinChange   : React.PropTypes.func.isRequired,
  onMappingMaxChange   : React.PropTypes.func.isRequired
};

export default PropertiesControlDisplay;
