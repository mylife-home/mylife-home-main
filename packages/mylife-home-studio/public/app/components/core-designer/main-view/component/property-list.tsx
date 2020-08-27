import React, { FunctionComponent } from 'react';

import { useCanvasTheme } from '../../drawing/theme';
import Border from '../../drawing/border';
import { Image } from '../../drawing/icon';
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

      <Border x={0} y={(theme.component.boxHeight * yIndex) - 1} width={theme.component.width} height={theme.component.boxHeight * items.length + 1} color={theme.borderColor} type='inner' />
    </>
  );
};

export default PropertyList;