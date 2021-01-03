import React, { FunctionComponent, CSSProperties } from 'react';

import { UiResource } from '../../../../store/ui-designer/types';
import { makeDataUrl } from '../resources/utils';

interface ImageProps {
  resource: UiResource;
  height?: number | string;
  width?: number | string;
  className?: string
  style?: CSSProperties;
}

const Image: FunctionComponent<ImageProps> = ({ resource, ...props }) => {
  const url = makeDataUrl(resource);
  return (
    <img src={url} {...props} />
  )
};

export default Image;
