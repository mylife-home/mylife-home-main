import React, { FunctionComponent, CSSProperties } from 'react';

import { useTabSelector } from '../../../lib/use-tab-selector';
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
  const resource = useTabSelector((state, tabId) => getResource(state, tabId, id));
  const url = makeDataUrl(resource);
  return (
    <img src={url} {...props} />
  );
};

export default Image;
