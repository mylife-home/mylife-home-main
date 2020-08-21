import React, { FunctionComponent } from 'react';
import { makeStyles, darken } from '@material-ui/core/styles';
import clsx from 'clsx';
import { Rect } from 'react-konva';

import SquareBox from './square-box';
import Canvas from './canvas';
import Component from './component';

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

  return (
    <SquareBox adjust='height' className={clsx(classes.container, className)}>
      <Canvas onSizeChange={(size) => console.log('onSizeChange', size)}>
        <Rect x={0} y={0} stroke={'blue'} width={100} height={100} />
        {components.map((component, index) => (
          <Component key={index} {...component} selected={index === selectedIndex} />  
        ))}
      </Canvas>
    </SquareBox>
  );
};

export default MiniView;