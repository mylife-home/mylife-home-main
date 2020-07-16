import React, { FunctionComponent } from 'react';
import Overlay from './overlay';

const Loading: FunctionComponent = () => (
  <Overlay>
    <img src='images/spinner.gif' className='mylife-img-loading' />
  </Overlay>
);

export default Loading;