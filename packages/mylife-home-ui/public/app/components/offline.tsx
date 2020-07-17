import React, { FunctionComponent } from 'react';
import Overlay from './overlay';

const Offline: FunctionComponent = () => (
  <Overlay>
    <img src='images/offline.svg' className='mylife-img-connecting' />
  </Overlay>
);

export default Offline;