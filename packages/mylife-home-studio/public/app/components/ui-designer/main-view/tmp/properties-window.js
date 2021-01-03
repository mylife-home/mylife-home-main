'use strict';

import React from 'react';
import icons from '../icons';

import PropertiesLabel from '../properties/properties-label';
import PropertiesTitle from '../properties/properties-title';
import PropertiesEditor from '../properties/properties-editor';

import ImageSelectorContainer from '../../containers/ui-project-tab/image-selector-container';

const PropertiesWindow = ({ project, window, onDelete, onChangeId, onResize, onChangeImage }) => (
  <div>
    <PropertiesTitle icon={<icons.UiWindow/>} text={window.id} onDelete={onDelete} />
    {/* details */}
    <table>
      <tbody>
        <tr>
          <td><PropertiesLabel text={'Id'} /></td>
          <td><PropertiesEditor id={`${window.uid}_id`} value={window.id} onChange={onChangeId} type={'s'} /></td>
        </tr>
        <tr>
          <td><PropertiesLabel text={'Width'} /></td>
          <td><PropertiesEditor id={`${window.uid}_width`} value={window.width} onChange={(value) => onResize({ height: window.height, width: value })} type={'i'} useRealType={true} /></td>
        </tr>
        <tr>
          <td><PropertiesLabel text={'Height'} /></td>
          <td><PropertiesEditor id={`${window.uid}_height`} value={window.height} onChange={(value) => onResize({ height: value, width: window.width })} type={'i'} useRealType={true} /></td>
        </tr>
        <tr>
          <td><PropertiesLabel text={'Background'} /></td>
          <td><ImageSelectorContainer project={project} image={window.backgroundResource} onImageChange={onChangeImage} /></td>
        </tr>
      </tbody>
    </table>
  </div>
);

PropertiesWindow.propTypes = {
  project       : React.PropTypes.number.isRequired,
  window        : React.PropTypes.object.isRequired,
  onDelete      : React.PropTypes.func.isRequired,
  onChangeId    : React.PropTypes.func.isRequired,
  onResize      : React.PropTypes.func.isRequired,
  onChangeImage : React.PropTypes.func.isRequired
};

export default PropertiesWindow;
