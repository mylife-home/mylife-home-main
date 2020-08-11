import React, { FunctionComponent, useEffect } from 'react';
import clsx from 'clsx';
import { DragSourceMonitor, useDrag } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';
import { makeStyles, darken } from '@material-ui/core/styles';

import Typography from '@material-ui/core/Typography';
import VisibilityIcon from '@material-ui/icons/Visibility';
import InputIcon from '@material-ui/icons/Input';

import { useCanvasContext } from './canvas';
import { Position, DndItemTypes } from './dnd';

interface StyleProps {
  gridSize: number;
}

const useStyles = makeStyles((theme) => {
  const backgroundColor = darken(theme.palette.background.paper, 0.03);
  const borderColor = darken(theme.palette.background.paper, 0.1);
  const borderColorSelected = theme.palette.primary.main;

  return {
    root: {
      position: 'absolute',
      display: 'flex',
      flexDirection: 'column',

      borderStyle: 'solid',
      borderWidth: 1,
      borderColor,
      boxSizing: 'content-box',

      backgroundColor
    },

    selected: {
      borderWidth: 2,
      borderColor: borderColorSelected
    },

    item: (props: StyleProps) => ({
      userSelect: 'none',
      paddingLeft: props.gridSize / 2,

      lineHeight: (props.gridSize - 1) + 'px',
      fontSize: props.gridSize * 0.6,

      '& > p': {
        lineHeight: 'inherit',
        fontSize: 'inherit',
        fontWeight: 'inherit'
      },
    }),

    title: {
      backgroundColor: borderColor,
      cursor: 'grab',
      fontWeight: 'bold'
    },

    prop: (props: StyleProps) => ({
      borderTopStyle: 'solid',
      borderTopWidth: 1,
      borderTopColor: borderColor,

      cursor: 'pointer',

      display: 'flex',
      alignItems: 'center',

      '& > p': {
        marginLeft: props.gridSize / 2,
      }
    }),

    state: {
    },

    action: {
    }
  };
});

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
  const classes = useStyles({ gridSize: canvasContext.gridSize });

  const [{ isDragging }, drag, preview] = useDrag({
    item: { type: DndItemTypes.COMPONENT, id, x, y },
    begin: () => onSelect(),
    collect: (monitor: DragSourceMonitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  useEffect(() => {
    preview(getEmptyImage(), { captureDraggingState: true })
  }, []);

  const boundingRectangle = {
    left: x * canvasContext.gridSize,
    top: y * canvasContext.gridSize,
    width: COMPONENT_WIDTH * canvasContext.gridSize,
    height: (states.length + actions.length + 1) * canvasContext.gridSize,
  };

  const itemStyle = {
    height: canvasContext.gridSize,
  };

  return (
    <div ref={preview} style={boundingRectangle} className={clsx(classes.root, selected && classes.selected)} onClick={() => onSelect()}>

      <div ref={drag} style={itemStyle} className={clsx(classes.item, classes.title)}>
        <Typography>
          {title}
        </Typography>
      </div>

      {states.map((state, index) => (
        <div key={index} style={itemStyle} className={clsx(classes.item, classes.prop, classes.state)}>
          <VisibilityIcon />
          <Typography>
            {state}
          </Typography>
        </div>
      ))}

      {actions.map((action, index) => (
        <div key={index} style={itemStyle} className={clsx(classes.item, classes.prop, classes.action)}>
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