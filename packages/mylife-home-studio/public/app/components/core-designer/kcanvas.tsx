import React, { FunctionComponent } from 'react';
import { Stage, Layer, Rect, Text } from 'react-konva';
import Konva from 'konva';

const KCanvas: FunctionComponent = () => {
  return (
    <Stage width={window.innerWidth} height={window.innerHeight}>
      <Layer>
        <Text text="Try click on rect" />
        <Rect
          x={20}
          y={20}
          width={50}
          height={50}
          fill={Konva.Util.getRandomColor()}
          shadowBlur={5}
          onClick={() => console.log('click')}
        />
      </Layer>
    </Stage>
    );
};

export default KCanvas;
