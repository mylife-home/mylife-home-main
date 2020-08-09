import React, { FunctionComponent } from 'react';
import clsx from 'clsx';
import { makeStyles, darken, fade } from '@material-ui/core/styles';
import BaseSplitPane, { SplitPaneProps } from 'react-split-pane';

const RESIZER_WIDTH = 5;

const useStyles = makeStyles(theme => {
  const backgroundColor = darken(theme.palette.background.paper, 0.1);
  const borderColor = fade(backgroundColor, 0.5);
  const marginSize = (RESIZER_WIDTH - 1) / 2;

  return {
    base: {
      backgroundColor,
      zIndex: 1,
      boxSizing: 'border-box',
      backgroundClip: 'padding-box',
    },
    horizontal: {
      height: RESIZER_WIDTH,

      marginTop: -marginSize,
      marginBottom: -marginSize,
      marginLeft: 0,
      marginRight: 0,

      borderTopWidth: marginSize,
      borderTopStyle: 'solid',
      borderTopColor: 'transparent',
      borderBottomWidth: marginSize,
      borderBottomStyle: 'solid',
      borderBottomColor: 'transparent',

      cursor: 'row-resize',
      width: '100%',
    
      '&:hover': {
        borderTopColor: borderColor,
        borderBottomColor: borderColor,
      }
    },
    vertical: {
      width: RESIZER_WIDTH,

      marginTop: 0,
      marginBottom: 0,
      marginLeft: -marginSize,
      marginRight: -marginSize,

      borderLeftWidth: marginSize,
      borderLeftStyle: 'solid',
      borderLeftColor: 'transparent',
      borderRightWidth: marginSize,
      borderRightStyle: 'solid',
      borderRightColor: 'transparent',

      cursor: 'col-resize',
      height: '100%',
    
      '&:hover': {
        borderLeftColor: borderColor,
        borderRightColor: borderColor,
      }
    },
    disabled: {
      cursor: 'not-allowed',

      '&:hover': {
        borderColor: 'transparent',
      }
    }
  };
});

const SplitPane: FunctionComponent<SplitPaneProps> = ({ resizerClassName, split, allowResize = true, ...props }) => {
  const classes = useStyles();
  const resizerClasses = clsx(resizerClassName, classes.base, classes[split], !allowResize && classes.disabled);

  return (
    <BaseSplitPane split={split} allowResize={allowResize} resizerClassName={resizerClasses} {...props} />
  );
};

export default SplitPane;