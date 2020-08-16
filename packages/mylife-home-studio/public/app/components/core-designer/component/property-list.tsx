import React, { FunctionComponent } from 'react';

import { useCanvasTheme } from '../base/theme';
import Border from '../base/border';
import { Image } from '../base/icon';
import Property from './property';

export interface PropertyListProps {
  yIndex: number;
  items: string[];
  icon: Image;
}

const PropertyList: FunctionComponent<PropertyListProps> = ({ yIndex, items, icon }) => {
  const theme = useCanvasTheme();

  if(!items.length) {
    return null;
  }

  return (
    <>
      {items.map((item, index) => (
        <Property key={index} yIndex={yIndex + index} icon={icon} text={item} />
      ))}

      <Border x={0} y={(theme.gridStep * yIndex) - 1} width={theme.component.width} height={theme.gridStep * items.length + 1} color={theme.borderColor} type='inner' />
    </>
  );
};

export default PropertyList;