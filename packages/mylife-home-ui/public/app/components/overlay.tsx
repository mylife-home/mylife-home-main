import React from 'react';

const Overlay = <P extends object>(props: P) => (
  <div className='mylife-overlay' {...props} />
);

export default Overlay;