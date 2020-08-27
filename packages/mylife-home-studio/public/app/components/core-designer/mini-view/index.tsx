import React, { FunctionComponent, useState, useCallback } from 'react';
import { makeStyles, darken } from '@material-ui/core/styles';
import clsx from 'clsx';

import { LAYER_SIZE } from '../base/defs';
import { Point } from '../base/types';
import { Selection } from '../types';
import SquareBox from './square-box';
import Canvas from './canvas';
import Component from './component';
import MainViewMark from './main-view-mark';
import { usePosition } from '../base/viewport-manips';

import * as schema from '../../../files/schema';

export interface MiniViewProps {
  className?: string;
  components: schema.Component[];
  selection: Selection;
}

const useStyles = makeStyles((theme) => ({
  container: {
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: darken(theme.palette.background.paper, 0.1),
    position: 'relative',
  }
}));

const MiniView: FunctionComponent<MiniViewProps> = ({ className, components, selection }) => {
  const classes = useStyles();
  const [size, setSize] = useState(1);
  const scale = size / LAYER_SIZE;

  const clickHandler = useClickHandler(scale);

  return (
    <SquareBox adjust='height' className={clsx(classes.container, className)}>
      <Canvas size={size} scale={scale} onSizeChange={setSize} onClick={clickHandler}>

        {components.map((component, index) => (
          <Component key={index} {...component} selected={selection?.type === 'component' && selection.index === index} />
        ))}

        <MainViewMark scale={scale}/>

        </Canvas>
    </SquareBox>
  );
};

export default MiniView;

function useClickHandler(scale: number) {
  const { setLayerPosition } = usePosition();

  return useCallback((pos: Point) => {
    const layerPosition = {
      x: pos.x / scale,
      y: pos.y / scale,
    };

    setLayerPosition(layerPosition);

  }, [scale, setLayerPosition]);
}
