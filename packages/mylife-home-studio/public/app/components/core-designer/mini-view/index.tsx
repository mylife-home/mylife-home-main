import React, { FunctionComponent, useState, useCallback } from 'react';
import { makeStyles, darken } from '@material-ui/core/styles';
import clsx from 'clsx';
import Konva from 'konva';

import { LAYER_SIZE } from '../base/defs';
import SquareBox from './square-box';
import Canvas from './canvas';
import Component from './component';
import MainViewMark from './main-view-mark';
import { useSetViewportLayerPosition } from '../base/viewport-manips';

export interface MiniViewProps {
  className?: string;
  components: any[];
  selectedIndex: number;
}

const useStyles = makeStyles((theme) => ({
  container: {
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: darken(theme.palette.background.paper, 0.1),
    position: 'relative',
  }
}));

const MiniView: FunctionComponent<MiniViewProps> = ({ className, components, selectedIndex }) => {
  const classes = useStyles();
  const [size, setSize] = useState(1);
  const scale = size / LAYER_SIZE;

  const clickHandler = useClickHandler(scale);

  return (
    <SquareBox adjust='height' className={clsx(classes.container, className)}>
      <Canvas size={size} scale={scale} onSizeChange={setSize} onClick={clickHandler}>

        {components.map((component, index) => (
          <Component key={index} {...component} selected={index === selectedIndex} />  
        ))}

        <MainViewMark scale={scale}/>

        </Canvas>
    </SquareBox>
  );
};

export default MiniView;

function useClickHandler(scale: number) {
  const setPosition = useSetViewportLayerPosition();

  return useCallback((pos: Konva.Vector2d) => {
    const layerPosition = {
      x: pos.x / scale,
      y: pos.y / scale,
    };

    setPosition(layerPosition);

  }, [scale, setPosition]);
}

function lockPosBetween(value: number, max: number) {
  if (value < 0) {
    return 0;
  }

  if (value > max) {
    return max;
  }
  
  return value;
}