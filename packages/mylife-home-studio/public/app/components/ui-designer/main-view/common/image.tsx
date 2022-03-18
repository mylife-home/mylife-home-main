import React, { FunctionComponent, CSSProperties } from 'react';
import { useSelector } from 'react-redux';

import { AppState } from '../../../../store/types';
import { getResource } from '../../../../store/ui-designer/selectors';
import { makeDataUrl } from '../resources/utils';

interface ImageProps {
  resource?: string;
  height?: number | string;
  width?: number | string;
  className?: string
  style?: CSSProperties;
}

const Image: FunctionComponent<ImageProps> = ({ resource, ...props }) => {
  if (!resource) {
    return null;
  }

  return (
    <NotNullImage resource={resource} {...props} />
  );
};

type NotNullImageProps = ImageProps & { resource: string };

const NotNullImage: FunctionComponent<NotNullImageProps> = ({ resource: id, ...props }) => {
  const resource = useSelector((state: AppState) => getResource(state, id));
  if(!resource) {
    console.warn(`Resource not found: '${id}'`);
    return null;
  }
  
  const url = makeDataUrl(resource);
  return (
    <img src={url} {...props} />
  );
};

export default Image;
