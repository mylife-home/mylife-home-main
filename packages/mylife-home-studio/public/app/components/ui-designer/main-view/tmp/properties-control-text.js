'use strict';

import React from 'react';

import PropertiesLabel from '../properties/properties-label';
import PropertiesEditor from '../properties/properties-editor';

import PropertiesControlTextContext from './properties-control-text-context';

const PropertiesControlText = ({
    project, control, components,
    onFormatChange, onTextNew, onTextDelete, onTextIdChange, onTextComponentChange
}) => (
  <tbody>
    <tr key="Format">
      <td><PropertiesLabel text={'Format (function body with context items as args)'} /></td>
      <td><PropertiesEditor id={`${control.uid}_text_format`} value={control.text.format} onChange={onFormatChange} type={'s'} /></td>
    </tr>
    <tr key="Context">
      <td><PropertiesLabel text={'Context'} /></td>
      <td>
        <PropertiesControlTextContext project={project}
                                      control={control}
                                      components={components}
                                      onNew={onTextNew}
                                      onDelete={onTextDelete}
                                      onIdChange={onTextIdChange}
                                      onComponentChange={onTextComponentChange} />
      </td>
    </tr>
  </tbody>
);

PropertiesControlText.propTypes = {
  project: React.PropTypes.number.isRequired,
  control: React.PropTypes.object.isRequired,
  components: React.PropTypes.object.isRequired,
  onFormatChange: React.PropTypes.func.isRequired,
  onTextNew: React.PropTypes.func.isRequired,
  onTextDelete: React.PropTypes.func.isRequired,
  onTextIdChange: React.PropTypes.func.isRequired,
  onTextComponentChange: React.PropTypes.func.isRequired
};

export default PropertiesControlText;
