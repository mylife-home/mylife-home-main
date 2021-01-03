'use strict';

import React from 'react';
import icons from '../icons';

import PropertiesLabel from '../properties/properties-label';
import PropertiesTitle from '../properties/properties-title';
import PropertiesEditor from '../properties/properties-editor';

import PropertiesControlDisplayContainer from '../../containers/ui-project-tab/properties-control-display-container';
import PropertiesControlTextContainer from '../../containers/ui-project-tab/properties-control-text-container';
import PropertiesControlActionContainer from '../../containers/ui-project-tab/properties-control-action-container';

const PropertiesControl =  ({ project, window, control, onDelete, onChangeId, onMove, onResize }) => (
  <div>
    <PropertiesTitle icon={control.text ? <icons.UiText/> : <icons.UiImage/>} text={control.id} onDelete={onDelete} />
    {/* details */}
    <table>
      <tbody>
        <tr>
          <td><PropertiesLabel text={'Id'} /></td>
          <td><PropertiesEditor id={`${control.uid}_id`} value={control.id} onChange={onChangeId} type={'s'} /></td>
        </tr>
        <tr>
          <td><PropertiesLabel text={'X'} /></td>
          <td><PropertiesEditor id={`${control.uid}_x`} value={control.x} onChange={(value) => onMove({ x: value, y: control.y })} type={'n'} useRealType={true} /></td>
        </tr>
        <tr>
          <td><PropertiesLabel text={'Y'} /></td>
          <td><PropertiesEditor id={`${control.uid}_y`} value={control.y} onChange={(value) => onMove({ x: control.x, y: value })} type={'n'} useRealType={true} /></td>
        </tr>
        <tr>
          <td><PropertiesLabel text={'Width'} /></td>
          <td><PropertiesEditor id={`${control.uid}_width`} value={control.width} onChange={(value) => onResize({ height: control.height, width: value })} type={'i'} useRealType={true} /></td>
        </tr>
        <tr>
          <td><PropertiesLabel text={'Height'} /></td>
          <td><PropertiesEditor id={`${control.uid}_height`} value={control.height} onChange={(value) => onResize({ height: value, width: control.width })} type={'i'} useRealType={true} /></td>
        </tr>
      </tbody>
      {control.text ? (<PropertiesControlTextContainer project={project} window={window} control={control} />) : (<PropertiesControlDisplayContainer project={project} window={window} control={control} />)}
      <tbody>
        <tr>
          <td><PropertiesLabel text={'Primary action'} /></td>
          <td>
            <PropertiesControlActionContainer project={project}
                                              window={window}
                                              control={control.uid}
                                              action={'primaryAction'} />
          </td>
        </tr>
        <tr>
          <td><PropertiesLabel text={'Secondary action'} /></td>
          <td>
            <PropertiesControlActionContainer project={project}
                                              window={window}
                                              control={control.uid}
                                              action={'secondaryAction'} />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
);

PropertiesControl.propTypes = {
  project: React.PropTypes.number.isRequired,
  window: React.PropTypes.number.isRequired,
  control: React.PropTypes.object.isRequired,
  onDelete:  React.PropTypes.func.isRequired,
  onChangeId:  React.PropTypes.func.isRequired,
  onMove:  React.PropTypes.func.isRequired,
  onResize:  React.PropTypes.func.isRequired
};

export default PropertiesControl;
