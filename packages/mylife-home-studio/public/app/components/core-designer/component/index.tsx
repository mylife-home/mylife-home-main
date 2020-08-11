import React, { FunctionComponent, forwardRef } from 'react';
import clsx from 'clsx';
import { useDrag } from 'react-dnd';

import Typography from '@material-ui/core/Typography';
import VisibilityIcon from '@material-ui/icons/Visibility';
import InputIcon from '@material-ui/icons/Input';

import { useCanvasContext } from '../canvas';
import { DndItemTypes } from '../dnd';
import { useComponentStyles } from './styles';
import Title from './title';

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

  const [, drag, preview] = useDrag({
    item: { type: DndItemTypes.COMPONENT, id, x, y },
  });

  const boundingRectangle = {
    left: x * canvasContext.gridSize,
    top: y * canvasContext.gridSize,
    width: COMPONENT_WIDTH * canvasContext.gridSize,
    height: (states.length + actions.length + 1) * canvasContext.gridSize,
  };

  return (
    <div ref={preview} style={boundingRectangle} className={clsx(classes.root, selected && classes.selected)} onMouseDown={() => onSelect()}>

      <Title ref={drag}>
        {title}
      </Title>

      {states.map((state, index) => (
        <div key={index} className={clsx(classes.item, classes.prop, classes.state)}>
          <VisibilityIcon />
          <Typography>
            {state}
          </Typography>
        </div>
      ))}

      {actions.map((action, index) => (
        <div key={index} className={clsx(classes.item, classes.prop, classes.action)}>
          <InputIcon />
          <Typography>
            {action}
          </Typography>
        </div>
      ))}

    </div>
  );
};

export default Component;