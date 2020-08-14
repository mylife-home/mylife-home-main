import React, { FunctionComponent, forwardRef } from 'react';
import clsx from 'clsx';
import { useDrag } from 'react-dnd';

import { useCanvasContext } from '../canvas';
import { DndItemTypes } from '../dnd';
import { useComponentStyles } from './styles';
import Title from './title';
import Prop from './prop';

const COMPONENT_WIDTH = 10;

export interface ComponentProps {
  id: string;
  x: number;
  y: number;
  selected?: boolean;
  title: string;
  states: string[];
  actions: string[];

  onSelect: () => void;
}

const Component: FunctionComponent<ComponentProps> = ({ id, x, y, selected = false, title, states, actions, onSelect }) => {
  const canvasContext = useCanvasContext();
  const classes = useComponentStyles();

  const [{ isDragging }, drag, preview] = useDrag({
    item: { type: DndItemTypes.COMPONENT, id, x, y },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  });

  const boundingRectangle = {
    left: x * canvasContext.gridSize,
    top: y * canvasContext.gridSize,
    width: COMPONENT_WIDTH * canvasContext.gridSize,
    height: (states.length + actions.length + 1) * canvasContext.gridSize,
  };

  const rootClasses = clsx(classes.root, selected && classes.selected, isDragging && classes.dragging);

  return (
    <div ref={preview} style={boundingRectangle} className={rootClasses} onMouseDown={onSelect}>

      <Title ref={drag}>
        {title}
      </Title>

      {states.map((state, index) => (
        <Prop key={index} type='state'>
          {state}
        </Prop>
      ))}

      {actions.map((action, index) => (
        <Prop key={index} type='action'>
          {action}
        </Prop>
      ))}

    </div>
  );
};

export default Component;