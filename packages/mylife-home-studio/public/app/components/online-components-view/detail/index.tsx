import React, { FunctionComponent } from 'react';

import { Selection } from '../common';
import None from './none';
import Instance from './instance';
import Plugin from './plugin';
import Component from './component';
import State from './state';

const Detail: FunctionComponent<{ selection: Selection }> = ({ selection }) => {
  if (!selection) {
    return <None />;
  }

  switch(selection.type) {
    case 'instance':
      return <Instance id={selection.id} />;
    case 'plugin':
      return <Plugin id={selection.id} />;
    case 'component':
      return <Component id={selection.id} />;
    case 'state':
      return <State id={selection.id} />;
    }
};

export default Detail;
