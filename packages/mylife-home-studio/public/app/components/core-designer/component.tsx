import React, { FunctionComponent } from 'react';
import clsx from 'clsx';
import { makeStyles, darken } from '@material-ui/core/styles';

import Typography from '@material-ui/core/Typography';
import { useCanvasContext } from './canvas';

interface StyleProps {
  gridSize: number;
}

const useStyles = makeStyles((theme) => {
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
    },
    selected: {
      borderWidth: 2,
      borderColor: borderColorSelected
    },
    item: (props: StyleProps) => ({
      userSelect: 'none',
      paddingLeft: props.gridSize / 2,

      '& > p': {
        lineHeight: (props.gridSize - 1) + 'px',
        fontSize: props.gridSize * 0.6
      }
    }),
    title: {
      backgroundColor: borderColor,

      '& > p': {
        fontWeight: 'bold'
      }
    },
    prop: {
      borderTopStyle: 'solid',
      borderTopWidth: 1,
      borderTopColor: borderColor,
    },
    state: {
    },
    action: {
    }
  };
});

const COMPONENT_WIDTH = 10;

export interface ComponentProps {
  x: number;
  y: number;
  selected?: boolean;
  title: string;
  states: string[];
  actions: string[];

  onSelect: () => void;
}

const Component: FunctionComponent<ComponentProps> = ({ x, y, selected = false, title, states, actions, onSelect }) => {
  const canvasContext = useCanvasContext();
  const classes = useStyles({ gridSize: canvasContext.gridSize });

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
    <div style={boundingRectangle} className={clsx(classes.root, selected && classes.selected)} onClick={() => onSelect()}>

      <div style={itemStyle} className={clsx(classes.item, classes.title)}>
        <Typography>
          {title}
        </Typography>
      </div>

      {states.map((state, index) => (
        <div key={index} style={itemStyle} className={clsx(classes.item, classes.prop, classes.state)}>
          <Typography>
            {state}
          </Typography>
        </div>
      ))}

      {actions.map((action, index) => (
        <div key={index} style={itemStyle} className={clsx(classes.item, classes.prop, classes.action)}>
          <Typography>
            {action}
          </Typography>
        </div>
      ))}

    </div>
  );
};

export default Component;