import React, { FunctionComponent } from 'react';
import Tooltip from '@material-ui/core/Tooltip';

const Hardware: FunctionComponent<{ value: string }> = ({ value }) => {
  if (!value) {
    return null;
  }

  // Display all before first ()
  // Note: inside () there are additional hw details on rpi
  const skipIndex = value.indexOf('(');
  if (skipIndex === -1) {
    return (
      <>
        {value}
      </>
    );
  }

  const main = value.substring(0, skipIndex).trimEnd();
  const details = value.slice(skipIndex + 1, -1); // expect ')' at the end

  return (
    <Tooltip title={details}>
      <div>
        {main}
      </div>
    </Tooltip>
  );
};

export default Hardware;
