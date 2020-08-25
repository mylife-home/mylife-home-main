import React, { FunctionComponent, useEffect, createRef } from 'react';
import { Group, KonvaNodeEvents } from 'react-konva';
import Konva from 'konva';

type Rectangle = { x: number, y: number, width: number, height: number };
type CacheGroupProps = Konva.NodeConfig & KonvaNodeEvents & React.ClassAttributes<Node> & Rectangle;

const CachedGroup: FunctionComponent<CacheGroupProps> = ({ x, y, width, height, ...props }) => {

  const rect = { x, y, width, height };
  const ref = useCache<Konva.Group>(rect);

  return (
    <Group {...props} {...rect} ref={ref} />
  );
};

export default CachedGroup;

function useCache<T extends Konva.Node>(rect: Rectangle) {
  const ref = createRef<T>();

  useEffect(() => {
    if (ref.current) {
      ref.current.cache(rect);
    }
  }, [ref.current, rect.x, rect.y, rect.width, rect.height]);

  return ref;
}
