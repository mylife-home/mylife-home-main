import React, { FunctionComponent, useEffect, createRef } from 'react';
import { Group, KonvaNodeEvents } from 'react-konva';
import Konva from 'konva';

type Rectangle = { x: number, y: number, width: number, height: number };
type CacheGroupProps = Konva.NodeConfig & KonvaNodeEvents & React.ClassAttributes<Node> & Rectangle;

const CachedGroup: FunctionComponent<CacheGroupProps> = ({ x, y, width, height, ...props }) => {

  const ref = useCache<Konva.Group>({ x, y, width, height });

  return (
    <Group {...props} ref={ref}/>
  );
};

export default CachedGroup;

function useCache<T extends Konva.Node>(rect: Rectangle) {
  const ref = createRef<T>();

  useEffect(() => {
    if (ref.current) {
      ref.current.cache({ x: rect.x - 10, y: rect.y - 10, width: rect.width + 20, height: rect.height + 20 });
    }
  }, [ref.current, rect.x, rect.y, rect.width, rect.height]);

  return ref;
}
