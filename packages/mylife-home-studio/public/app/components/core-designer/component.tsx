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
  const borderColorSelected = darken(theme.palette.background.paper, 0.2);

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
      paddingLeft: props.gridSize / 2,
    }),
    title: {
      backgroundColor: borderColor,
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
}

const Component: FunctionComponent<ComponentProps> = ({ x, y, selected = false, title, states, actions }) => {
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
    <div style={boundingRectangle} className={clsx(classes.root, selected && classes.selected)}>

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