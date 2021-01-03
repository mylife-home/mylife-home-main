'use strict';

import React from 'react';
import icons from '../icons';

import PropertiesLabel from '../properties/properties-label';
import PropertiesTitle from '../properties/properties-title';
import PropertiesValue from '../properties/properties-value';

const PropertiesComponent = ({ component, onDelete }) => (
  <div>
    <PropertiesTitle icon={<icons.Component/>} text={component.id} onDelete={onDelete} />
    {/* details */}
    <table>
      <tbody>
        <tr>
          <td><PropertiesLabel text={'Id'} /></td>
          <td><PropertiesValue value={component.id} /></td>
        </tr>
      </tbody>
    </table>
  </div>
);

PropertiesComponent.propTypes = {
  component : React.PropTypes.object.isRequired,
  onDelete  : React.PropTypes.func.isRequired
};

export default PropertiesComponent;
