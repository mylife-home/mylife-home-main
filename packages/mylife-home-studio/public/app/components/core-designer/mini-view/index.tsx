import React, { FunctionComponent, useState } from 'react';
import { makeStyles, darken } from '@material-ui/core/styles';
import clsx from 'clsx';

import { LAYER_SIZE } from '../base/defs';
import SquareBox from './square-box';
import Canvas from './canvas';
import Component from './component';
import MainViewMark from './main-view-mark';

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

  return (
    <SquareBox adjust='height' className={clsx(classes.container, className)}>
      <Canvas size={size} scale={scale} onSizeChange={setSize}>

        <MainViewMark scale={scale}/>

        {components.map((component, index) => (
          <Component key={index} {...component} selected={index === selectedIndex} />  
        ))}
      </Canvas>
    </SquareBox>
  );
};

export default MiniView;