import React, { FunctionComponent, useState } from 'react';
import Konva from 'konva';

import Canvas from './canvas';

export interface MiniViewProps {
  components: any;
}

const MiniView: FunctionComponent<MiniViewProps> = ({ components }) => {

  return (
    <Canvas onSizeChange={(size) => console.log('onSizeChange', size)}>
      {/*
      {components.map((component, index) => (
        <Component key={index} {...component} selected={index === selectedIndex} onSelect={() => setSelectedIndex(index)} onMove={(pos: Konva.Vector2d) => handleMoveComponent(component.id, pos)} />  
      ))}
      */}
    </Canvas>
  );
};

export default MiniView;