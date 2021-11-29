import React, { FunctionComponent } from 'react';
import Tooltip from '@material-ui/core/Tooltip';
import { addLineBreaks } from '../lib/add-line-breaks';

const Hardware: FunctionComponent<{ value: string | { [name: string]: string } }> = ({ value }) => {
  if (!value) {
    return null;
  }

  // TODO: remove this legacy when no instance use the old format
  if (typeof value === 'string') {
    return (
      <>
        {value}
      </>
    );
  }

  const { main, ...detailsObject } = value;
  const details = Object.entries(detailsObject).map(([name, value]) => `${name}: ${value}`);

  return (
    <Tooltip title={addLineBreaks(details)}>
      <div>
        {main}
      </div>
    </Tooltip>
  );
};

export default Hardware;
