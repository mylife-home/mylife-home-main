'use strict';

import React from 'react';
import icons from '../icons';

import PropertiesLabel from '../properties/properties-label';
import PropertiesTitle from '../properties/properties-title';
import PropertiesValue from '../properties/properties-value';
import PropertiesEditor from '../properties/properties-editor';

import WindowSelectorContainer from '../../containers/ui-project-tab/window-selector-container';

const PropertiesProject = ({ project, onNameChange, onDesktopWindowChange, onMobileWindowChange }) => (
  <div>
    <PropertiesTitle icon={<icons.tabs.Ui/>} text={'Project'} />
    {/* details */}
    <table>
      <tbody>
        <tr>
          <td><PropertiesLabel text={'Name'}/></td>
          <td><PropertiesEditor id={`${project.uid}_name`} value={project.name} onChange={onNameChange} type={'s'} /></td>
        </tr>
        <tr>
          <td><PropertiesLabel text={'Creation'}/></td>
          <td><PropertiesValue value={project.creationDate.toISOString()}/></td>
        </tr>
        <tr>
          <td><PropertiesLabel text={'Last update'}/></td>
          <td><PropertiesValue value={project.lastUpdate.toISOString()}/></td>
        </tr>
        <tr>
          <td><PropertiesLabel text={'Default desktop window'}/></td>
          <td><WindowSelectorContainer project={project.uid} window={project.desktopDefaultWindow} onWindowChange={onDesktopWindowChange} /></td>
        </tr>
        <tr>
          <td><PropertiesLabel text={'Default mobile window'}/></td>
          <td><WindowSelectorContainer project={project.uid} window={project.mobileDefaultWindow} onWindowChange={onMobileWindowChange} /></td>
        </tr>
      </tbody>
    </table>
  </div>
);

PropertiesProject.propTypes = {
  project               : React.PropTypes.object.isRequired,
  onNameChange          : React.PropTypes.func.isRequired,
  onDesktopWindowChange : React.PropTypes.func.isRequired,
  onMobileWindowChange  : React.PropTypes.func.isRequired
};

export default PropertiesProject;
