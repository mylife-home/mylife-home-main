import React, { FunctionComponent } from 'react';

const CanvasControl: FunctionComponent<{ id: string; }> = ({ id }) => {
  return (
    <div style={{ position: 'absolute', top: 0, left: 0 }}>
      {id}
    </div>
  );
};

export default CanvasControl;