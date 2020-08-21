import React, { FunctionComponent, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import Konva from 'konva';

import SquareBox from './square-box';
import Canvas from './canvas';
import { Rect } from 'react-konva';

export interface MiniViewProps {
  className?: string;
  components: any;
}

const useStyles = makeStyles((theme) => ({
  container: {
    position: 'relative',
  }
}));

const MiniView: FunctionComponent<MiniViewProps> = ({ className, components }) => {
  const classes = useStyles();

  return (
    <SquareBox adjust='height' className={clsx(classes.container, className)}>
      <Canvas onSizeChange={(size) => console.log('onSizeChange', size)}>
        <Rect x={0} y={0} fill={'blue'} width={10000} height={10000} />
        {/*
        {components.map((component, index) => (
          <Component key={index} {...component} selected={index === selectedIndex} onSelect={() => setSelectedIndex(index)} onMove={(pos: Konva.Vector2d) => handleMoveComponent(component.id, pos)} />  
        ))}
        */}
      </Canvas>
    </SquareBox>
  );
};

export default MiniView;